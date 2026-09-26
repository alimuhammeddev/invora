"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../../../lib/firebase";
import { softDeleteUserAccount } from "../../../lib/userAccount";
import { subscribeToUserInvoices } from "../../../lib/invoices";
import {
  User,
  Building2,
  Bell,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Camera,
  Mail,
  Lock,
  Trash2,
  Check,
} from "lucide-react";

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    description: "Manage your personal information",
    icon: User,
  },
  {
    id: "business",
    label: "Business",
    description: "Your business details",
    icon: Building2,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Control your email notifications",
    icon: Bell,
  },
  {
    id: "billing",
    label: "Billing & Plan",
    description: "Manage your subscription",
    icon: CreditCard,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and account security",
    icon: ShieldCheck,
  },
];

const businessInputClassName =
  "mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (user) => {
      setEmail(user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    if (activeSection !== "billing") return;
    if (!firebaseAuth) {
      setBillingError(true);
      return;
    }

    setBillingLoading(true);
    setBillingError(false);
    let unsubscribeInvoices: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribeInvoices?.();
      if (!user) {
        setInvoiceCount(0);
        setClientCount(0);
        setBillingLoading(false);
        return;
      }

      unsubscribeInvoices = subscribeToUserInvoices(
        user.uid,
        (invoices) => {
          setInvoiceCount(invoices.length);
          setClientCount(
            new Set(
              invoices
                .map((invoice) => invoice.client.trim().toLowerCase())
                .filter(Boolean),
            ).size,
          );
          setBillingLoading(false);
        },
        () => {
          setBillingError(true);
          setBillingLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeInvoices?.();
    };
  }, [activeSection]);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) {
      setDeleteError("You are not signed in. Sign in again to delete your account.");
      return;
    }

    setDeletingAccount(true);
    setDeleteError(null);
    try {
      await softDeleteUserAccount(currentUser);
      await signOut(currentUser.auth);
      router.replace("/login");
    } catch {
      setDeleteError("We couldn't delete your account. Please try again.");
      setDeletingAccount(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50/60">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account, business preferences and settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Settings Navigation */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2">
            <div className="space-y-1">
              {settingsSections.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p
                        className={`mt-0.5 truncate text-xs ${
                          active ? "text-blue-500" : "text-slate-400"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className={`shrink-0 ${
                        active ? "text-blue-500" : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Settings Content */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white">
            {/* Profile */}
            {activeSection === "profile" && (
              <>
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your personal information and profile details.
                  </p>
                </div>

                <div className="space-y-7 p-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                        MA
                      </div>

                      <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition hover:bg-blue-700">
                        <Camera size={13} />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Profile photo
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        First name
                      </label>
                      <input
                        type="text"
                        defaultValue="Muhammed"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Last name
                      </label>
                      <input
                        type="text"
                        defaultValue="Ali"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={email}
                        readOnly
                        placeholder="No email available"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-sm text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone number
                    </label>

                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                  <button className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                  >
                    {saved && <Check size={16} />}
                    {saved ? "Saved" : "Save changes"}
                  </button>
                </div>
              </>
            )}

            {/* Business */}
            {activeSection === "business" && (
              <SettingsPanel
                title="Business details"
                description="Manage the information that appears on your invoices."
              >
                <div className="space-y-7">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business name
                    </label>
                    <input
                      type="text"
                      defaultValue="Your Business"
                      className={businessInputClassName}
                    />
                    <p className="mt-1.5 text-xs text-slate-400">
                      This name appears at the top of your invoices.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Business email
                      </label>
                      <input
                        type="email"
                        defaultValue="hello@business.com"
                        className={businessInputClassName}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        placeholder="+234 800 000 0000"
                        className={businessInputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter your business address"
                      className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Currency
                      </label>
                      <select className={`${businessInputClassName} cursor-pointer`}>
                        <option>USD — US Dollar</option>
                        <option>NGN — Nigerian Naira</option>
                        <option>GBP — British Pound</option>
                        <option>EUR — Euro</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        className={businessInputClassName}
                      />
                    </div>
                  </div>
                </div>

                <SettingsFooter onSave={handleSave} saved={saved} />
              </SettingsPanel>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <SettingsPanel
                title="Notifications"
                description="Choose which notifications you want to receive."
              >
                <div className="divide-y divide-slate-100">
                  <NotificationRow
                    title="Invoice paid"
                    description="Get notified when a client pays an invoice."
                    defaultChecked
                  />

                  <NotificationRow
                    title="Invoice overdue"
                    description="Receive an alert when an invoice becomes overdue."
                    defaultChecked
                  />

                  <NotificationRow
                    title="Payment reminders"
                    description="Get notified when automatic reminders are sent."
                    defaultChecked
                  />

                  <NotificationRow
                    title="Weekly summary"
                    description="Receive a weekly overview of your invoicing activity."
                  />

                  <NotificationRow
                    title="Product updates"
                    description="Stay informed about new Invora features and updates."
                  />
                </div>

                <SettingsFooter onSave={handleSave} saved={saved} />
              </SettingsPanel>
            )}

            {/* Billing */}
            {activeSection === "billing" && (
              <SettingsPanel
                title="Billing & Plan"
                description="Manage your Invora subscription and billing details."
              >
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Current plan
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">
                        Free Plan
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Create and manage invoices with the essentials.
                      </p>
                    </div>

                    <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
                      Upgrade plan
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <UsageCard
                    label="Invoices"
                    value={billingLoading ? "Loading..." : billingError ? "Unavailable" : String(invoiceCount)}
                  />
                  <UsageCard
                    label="Clients"
                    value={billingLoading ? "Loading..." : billingError ? "Unavailable" : String(clientCount)}
                  />
                  <UsageCard label="Storage" value="Unlimited" />
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Billing information
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    No payment method has been added yet.
                  </p>

                  <button className="mt-4 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Add payment method
                  </button>
                </div>
              </SettingsPanel>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <SettingsPanel
                title="Security"
                description="Keep your Invora account secure."
              >
                <div className="max-w-2xl space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Current password
                    </label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter current password"
                        className={`${businessInputClassName} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      New password
                    </label>
                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        placeholder="Enter new password"
                        className={`${businessInputClassName} pl-11`}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Use at least 8 characters.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        className={`${businessInputClassName} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                <SettingsFooter onSave={handleSave} saved={saved} />

                <div className="mt-8 border-t border-red-100 pt-6">
                  <h3 className="text-sm font-semibold text-red-600">
                    Danger zone
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Permanently delete your Invora account and all associated
                    data.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteConfirmationOpen(true);
                    }}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete account
                  </button>
                </div>
              </SettingsPanel>
            )}

          </div>
        </div>
      </div>
      {deleteConfirmationOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/45 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>
            <h2 id="delete-account-title" className="mt-4 text-lg font-semibold text-slate-900">
              Delete your account?
            </h2>
            <p id="delete-account-description" className="mt-2 text-sm leading-6 text-slate-600">
              You will be signed out and cannot log in until you restore the account through sign up. Your profile and invoices will remain stored and return when you restore it with the same sign-in details.
            </p>
            {deleteError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmationOpen(false)}
                disabled={deletingAccount}
                className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingAccount ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

/* ---------------- Components ---------------- */

function SettingsPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="p-6">{children}</div>
    </>
  );
}

function SettingsFooter({
  onSave,
  saved,
}: {
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
      <button className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
        Cancel
      </button>

      <button
        onClick={onSave}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        {saved && <Check size={16} />}
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}

function NotificationRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        onClick={() => setChecked(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function UsageCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

