import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { firebaseDb, firebaseSetupMessage } from "./firebase";

export type NotificationKind =
  | "invoice_created"
  | "invoice_paid"
  | "invoice_overdue";

export type ActivityNotification = {
  id: string;
  type: NotificationKind;
  title: string;
  message: string;
  invoiceId: string;
  invoiceNumber: string;
  read: boolean;
  createdAt?: Timestamp;
};

export function userNotificationsCollection(userId: string) {
  if (!firebaseDb) throw new Error(firebaseSetupMessage);
  return collection(firebaseDb, "users", userId, "notifications");
}

export function subscribeToUserNotifications(
  userId: string,
  onNotifications: (notifications: ActivityNotification[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    userNotificationsCollection(userId),
    (snapshot) => {
      const notifications = snapshot.docs.map(
        (notificationDocument) =>
          ({
            id: notificationDocument.id,
            ...notificationDocument.data(),
          }) as ActivityNotification,
      );
      notifications.sort(
        (first, second) =>
          (second.createdAt?.toMillis() ?? 0) -
          (first.createdAt?.toMillis() ?? 0),
      );
      onNotifications(notifications);
    },
    onError,
  );
}

export async function markUserNotificationsRead(
  userId: string,
  notificationIds: string[],
) {
  if (!notificationIds.length) return;
  const notifications = userNotificationsCollection(userId);

  for (let start = 0; start < notificationIds.length; start += 450) {
    const batch = writeBatch(notifications.firestore);
    for (const notificationId of notificationIds.slice(start, start + 450)) {
      batch.update(doc(notifications, notificationId), { read: true });
    }
    await batch.commit();
  }
}