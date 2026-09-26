"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowUpRight,
  Bell,
  CircleCheck,
  Clock3,
  FilePlus2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { firebaseAuth, firebaseSetupMessage } from "../../../lib/firebase";
import {
  markUserNotificationsRead,
  subscribeToUserNotifications,
  type ActivityNotification,
  type NotificationKind,
} from "../../../lib/notifications";

const notificationAppearance: Record<
  NotificationKind,
  { icon: typeof Bell; iconClass: string; title: string }
> = {
  invoice_created: {
    icon: FilePlus2,
    iconClass: "bg-blue-50 text-blue-700",
    title: "Invoice created",
  },
  invoice_paid: {
    icon: CircleCheck,
    iconClass: "bg-emerald-50 text-emerald-700",
    title: "Invoice paid",
  },
  invoice_overdue: {
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-700",
    title: "Invoice overdue",
  },
};

function formatNotificationDate(value?: ActivityNotification["createdAt"]) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value.toDate());
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) {
      setError(firebaseSetupMessage);
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribeNotifications: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribeNotifications?.();
      setNotifications([]);
      setError(null);
      setLoading(true);

      if (!user) {
        setError("Sign in to view your notifications.");
        setLoading(false);
        return;
      }

      unsubscribeNotifications = subscribeToUserNotifications(
        user.uid,
        (records) => {
          if (!active) return;
          setNotifications(records);
          setLoading(false);
          const unreadIds = records
            .filter((notification) => !notification.read)
            .map((notification) => notification.id);
          if (unreadIds.length) {
            void markUserNotificationsRead(user.uid, unreadIds).catch(() => {
              if (active) {
                setError(
                  "Could not update notification status. Publish the latest firestore.rules in Firebase Console.",
                );
              }
            });
          }
        },
        (loadError) => {
          if (!active) return;
          setError(
            loadError instanceof FirebaseError &&
              loadError.code === "permission-denied"
              ? "Firestore blocked notification access. Publish the latest firestore.rules in Firebase Console."
              : "Could not load notifications. Check your connection and try again.",
          );
          setLoading(false);
        },
      );
    });

    return () => {
      active = false;
      unsubscribeAuth();
      unsubscribeNotifications?.();
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <section className="mx-auto space-y-6">
      <header className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Activity
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Invoice activity and payment updates.
          </p>
        </div>
        {!loading && !error && unreadCount > 0 && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            {unreadCount} new
          </span>
        )}
      </header>

      {loading ? (
        <p className="py-16 text-center text-sm text-neutral-500">
          Loading notifications...
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : notifications.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center bg-white px-6 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Bell className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-neutral-900">
            No activity yet
          </h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-neutral-500">
            Updates will appear here when you create an invoice or its payment status changes.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200 bg-white">
          {notifications.map((notification) => {
            const appearance = notificationAppearance[notification.type];
            const Icon = appearance.icon;

            return (
              <li key={notification.id}>
                <Link
                  href={`/dashboard/invoices/${notification.invoiceId}`}
                  className="group flex items-start gap-4 px-4 py-5 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-6"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${appearance.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-neutral-900">
                        {appearance.title}
                      </span>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                      <span className="text-xs text-neutral-400">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-neutral-600">
                      {notification.message}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-blue-600" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}