import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb, firebaseSetupMessage } from "./firebase";

export type BusinessDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export const emptyBusinessDetails: BusinessDetails = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export function hasRequiredBusinessDetails(
  details: BusinessDetails | null | undefined,
) {
  return Boolean(details?.name.trim() && details.address.trim());
}

function accountDocument(userId: string) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);
  return doc(firebaseDb, "users", userId);
}

export async function isAccountDeleted(userId: string) {
  const snapshot = await getDoc(accountDocument(userId));
  return snapshot.exists() && snapshot.data().accountStatus === "deleted";
}

export async function getBusinessDetails(userId: string) {
  const snapshot = await getDoc(accountDocument(userId));
  const details = snapshot.data()?.businessDetails;
  if (!details || typeof details !== "object") return { ...emptyBusinessDetails };

  return {
    name: typeof details.name === "string" ? details.name : "",
    email: typeof details.email === "string" ? details.email : "",
    phone: typeof details.phone === "string" ? details.phone : "",
    address: typeof details.address === "string" ? details.address : "",
  };
}

export async function saveBusinessDetails(
  user: User,
  details: BusinessDetails,
) {
  const reference = accountDocument(user.uid);
  const snapshot = await getDoc(reference);
  const businessDetails = {
    name: details.name.trim(),
    email: details.email.trim(),
    phone: details.phone.trim(),
    address: details.address.trim(),
  };

  await setDoc(
    reference,
    {
      ...(!snapshot.exists()
        ? {
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            accountStatus: "active",
            createdAt: serverTimestamp(),
          }
        : {}),
      businessDetails,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function activateUserAccount(user: User, displayName?: string) {
  const reference = accountDocument(user.uid);
  const snapshot = await getDoc(reference);
  const wasDeleted = snapshot.exists() && snapshot.data().accountStatus === "deleted";

  await setDoc(
    reference,
    {
      email: user.email ?? "",
      displayName: displayName?.trim() || user.displayName || "",
      accountStatus: "active",
      updatedAt: serverTimestamp(),
      ...(snapshot.exists()
        ? wasDeleted
          ? { deletedAt: deleteField(), restoredAt: serverTimestamp() }
          : {}
        : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );

  return wasDeleted;
}

export async function softDeleteUserAccount(user: User) {
  const reference = accountDocument(user.uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    await setDoc(reference, {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      accountStatus: "active",
      createdAt: serverTimestamp(),
    });
  }

  await setDoc(
    reference,
    {
      accountStatus: "deleted",
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}