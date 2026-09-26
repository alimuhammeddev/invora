import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { firebaseDb, firebaseSetupMessage } from "./firebase";

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
  currency: "NGN";
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
          void updateDoc(invoiceDocument.ref, { status: "overdue" }).catch(
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
  const document = await addDoc(userInvoicesCollection(userId), {
    ...invoice,
    status: "unpaid",
    createdAt: serverTimestamp(),
  });
  return document.id;
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
  batch.set(shareReference, { ownerUid: userId, invoice: publicInvoice });
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
  if (!firebaseDb) throw new Error(firebaseSetupMessage);

  const invoiceReference = doc(
    firebaseDb,
    "users",
    userId,
    "invoices",
    invoiceId,
  );
  const invoiceSnapshot = await getDoc(invoiceReference);
  const batch = writeBatch(firebaseDb);
  batch.update(invoiceReference, { status });

  const shareId = invoiceSnapshot.data()?.shareId;
  if (typeof shareId === "string") {
    batch.update(doc(firebaseDb, "publicInvoices", shareId), {
      "invoice.status": status,
    });
  }

  await batch.commit();
}