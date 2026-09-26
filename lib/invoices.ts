import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { firebaseDb, firebaseSetupMessage } from "./firebase";
import { userNotificationsCollection } from "./notifications";

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  fromName: string;
  fromAddress: string;
  logoDataUrl?: string;
  client: string;
  clientEmail?: string;
  clientAddress: string;
  issuedOn: string;
  dueOn: string;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  amount: number;
  currency: string;
  bank: string;
  account: string;
  status: InvoiceStatus;
  shareId?: string;
  createdAt?: Timestamp;
};

export type NewInvoiceRecord = Omit<
  InvoiceRecord,
  "id" | "status" | "shareId" | "createdAt"
>;

export type PublicInvoiceRecord = Omit<
  InvoiceRecord,
  "clientEmail" | "shareId" | "createdAt"
>;

function userInvoicesCollection(userId: string) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);
  return collection(firebaseDb, "users", userId, "invoices");
}

export function subscribeToUserInvoices(
  userId: string,
  onInvoices: (invoices: InvoiceRecord[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    userInvoicesCollection(userId),
    (snapshot) => {
      const invoices = snapshot.docs.map(
        (invoiceDocument) =>
          ({ id: invoiceDocument.id, ...invoiceDocument.data() }) as InvoiceRecord,
      );

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      for (const invoiceDocument of snapshot.docs) {
        const invoice = invoiceDocument.data() as Omit<InvoiceRecord, "id">;
        if (invoice.status === "unpaid" && invoice.dueOn < today) {
          void markUserInvoiceOverdue(userId, invoiceDocument.id, today).catch(
            onError,
          );
        }
      }

      invoices.sort(
        (first, second) =>
          (second.createdAt?.toMillis() ?? 0) -
          (first.createdAt?.toMillis() ?? 0),
      );
      onInvoices(invoices);
    },
    onError,
  );
}

export async function createUserInvoice(
  userId: string,
  invoice: NewInvoiceRecord,
) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);

  const invoiceReference = doc(userInvoicesCollection(userId));
  const notificationReference = doc(userNotificationsCollection(userId));
  const batch = writeBatch(firebaseDb);
  batch.set(invoiceReference, {
    ...invoice,
    status: "unpaid",
    createdAt: serverTimestamp(),
  });
  batch.set(notificationReference, {
    type: "invoice_created",
    title: "Invoice created",
    message: `Invoice ${invoice.invoiceNumber} was created.`,
    invoiceId: invoiceReference.id,
    invoiceNumber: invoice.invoiceNumber,
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return invoiceReference.id;
}

export async function createPublicInvoiceShare(
  userId: string,
  invoice: InvoiceRecord,
) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);
  if (invoice.shareId) return invoice.shareId;

  const shareReference = doc(collection(firebaseDb, "publicInvoices"));
  const batch = writeBatch(firebaseDb);
  const publicInvoice: PublicInvoiceRecord = {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    fromName: invoice.fromName,
    fromAddress: invoice.fromAddress,
    ...(invoice.logoDataUrl ? { logoDataUrl: invoice.logoDataUrl } : {}),
    client: invoice.client,
    clientAddress: invoice.clientAddress,
    issuedOn: invoice.issuedOn,
    dueOn: invoice.dueOn,
    items: invoice.items,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    amount: invoice.amount,
    currency: invoice.currency,
    bank: invoice.bank,
    account: invoice.account,
    status: invoice.status,
  };

  batch.update(doc(firebaseDb, "users", userId, "invoices", invoice.id), {
    shareId: shareReference.id,
  });
  batch.set(shareReference, { invoice: publicInvoice });
  await batch.commit();

  return shareReference.id;
}

export async function getPublicInvoiceShare(shareId: string) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);

  const snapshot = await getDoc(doc(firebaseDb, "publicInvoices", shareId));
  if (!snapshot.exists()) return null;

  return snapshot.data().invoice as PublicInvoiceRecord;
}

export async function updateUserInvoiceStatus(
  userId: string,
  invoiceId: string,
  status: "paid",
) {
  const db = firebaseDb;
  if (!db) throw new Error(firebaseSetupMessage);

  const invoiceReference = doc(
    db,
    "users",
    userId,
    "invoices",
    invoiceId,
  );
  const notificationReference = doc(
    userNotificationsCollection(userId),
    `invoice-paid-${invoiceId}`,
  );

  await runTransaction(db, async (transaction) => {
    const invoiceSnapshot = await transaction.get(invoiceReference);
    if (!invoiceSnapshot.exists()) return;

    const invoice = invoiceSnapshot.data() as Omit<InvoiceRecord, "id">;
    if (invoice.status === "paid") return;

    const publicInvoiceReference = invoice.shareId
      ? doc(db, "publicInvoices", invoice.shareId)
      : null;
    const publicInvoiceSnapshot = publicInvoiceReference
      ? await transaction.get(publicInvoiceReference)
      : null;

    transaction.update(invoiceReference, { status });
    transaction.set(notificationReference, {
      type: "invoice_paid",
      title: "Invoice marked paid",
      message: `Invoice ${invoice.invoiceNumber} was marked as paid.`,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      read: false,
      createdAt: serverTimestamp(),
    });
    if (publicInvoiceReference && publicInvoiceSnapshot?.exists()) {
      transaction.update(publicInvoiceReference, { "invoice.status": status });
    }
  });
}

async function markUserInvoiceOverdue(
  userId: string,
  invoiceId: string,
  today: string,
) {
  const db = firebaseDb;
  if (!db) throw new Error(firebaseSetupMessage);

  const invoiceReference = doc(
    db,
    "users",
    userId,
    "invoices",
    invoiceId,
  );
  const notificationReference = doc(
    userNotificationsCollection(userId),
    `invoice-overdue-${invoiceId}`,
  );

  await runTransaction(db, async (transaction) => {
    const invoiceSnapshot = await transaction.get(invoiceReference);
    if (!invoiceSnapshot.exists()) return;

    const invoice = invoiceSnapshot.data() as Omit<InvoiceRecord, "id">;
    if (invoice.status !== "unpaid" || invoice.dueOn >= today) return;

    const publicInvoiceReference = invoice.shareId
      ? doc(db, "publicInvoices", invoice.shareId)
      : null;
    const publicInvoiceSnapshot = publicInvoiceReference
      ? await transaction.get(publicInvoiceReference)
      : null;

    transaction.update(invoiceReference, { status: "overdue" });
    transaction.set(notificationReference, {
      type: "invoice_overdue",
      title: "Invoice overdue",
      message: `Invoice ${invoice.invoiceNumber} is now overdue.`,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      read: false,
      createdAt: serverTimestamp(),
    });
    if (publicInvoiceReference && publicInvoiceSnapshot?.exists()) {
      transaction.update(publicInvoiceReference, {
        "invoice.status": "overdue",
      });
    }
  });
}