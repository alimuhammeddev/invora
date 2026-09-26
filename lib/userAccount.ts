import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb, firebaseSetupMessage } from "./firebase";

function accountDocument(userId: string) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);
  return doc(firebaseDb, "users", userId);
}

export async function isAccountDeleted(userId: string) {
  const snapshot = await getDoc(accountDocument(userId));
  return snapshot.exists() && snapshot.data().accountStatus === "deleted";
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