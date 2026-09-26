import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
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
  createdAt?: Timestamp;
};

export type NewInvoiceRecord = Omit<InvoiceRecord, "id" | "status" | "createdAt">;

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

export async function updateUserInvoiceStatus(
  userId: string,
  invoiceId: string,
  status: "paid",
) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);
  await updateDoc(doc(firebaseDb, "users", userId, "invoices", invoiceId), {
    status,
  });
}