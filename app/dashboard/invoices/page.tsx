"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import NewInvoiceModal from "./components/NewInvoiceModal";
import { formatCurrencyAmount } from "../../../lib/currency";
import { firebaseAuth, firebaseSetupMessage } from "../../../lib/firebase";
import {
  createUserInvoice,
  subscribeToUserInvoices,
  type InvoiceRecord,
} from "../../../lib/invoices";

type Status = InvoiceRecord["status"];
type Invoice = InvoiceRecord;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

const formatAmount = (invoice: Invoice) =>
  formatCurrencyAmount(invoice.amount, invoice.currency);

function generateInvoiceNumber(invoices: Invoice[]) {
  const existingNumbers = new Set(
    invoices.map((invoice) => invoice.invoiceNumber),
  );
  const year = new Date().getFullYear();
  let invoiceNumber = "";

  do {
    const randomValue = new Uint32Array(1);
    globalThis.crypto.getRandomValues(randomValue);
    const uniqueDigits = String(randomValue[0] % 1_000_000_000).padStart(
      9,
      "0",
    );
    invoiceNumber = `INV-${year}-${uniqueDigits}`;
  } while (existingNumbers.has(invoiceNumber));

  return invoiceNumber;
}

/* ---------- Icons ---------- */

function Icon({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const SearchPaths = (
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.35-4.35" />
  </>
);

const DocumentPaths = (
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </>
);

/* ---------- Status pill ---------- */

const statusConfig: Record<Status, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-blue-50 text-blue-600" },
  unpaid: { label: "Unpaid", className: "bg-amber-50 text-amber-600" },
  overdue: { label: "Overdue", className: "bg-red-50 text-red-600" },
};

function StatusPill({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          status === "paid"
            ? "bg-emerald-700"
            : status === "unpaid"
              ? "bg-amber-500"
              : "bg-rose-700"
        }`}
      />
      {config.label}
    </span>
  );
}

/* ---------- Filters ---------- */

const filters: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

/* ---------- Page ---------- */

export default function Invoices() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoadError(firebaseSetupMessage);
      setLoading(false);
      return;
    }

    let unsubscribeInvoices: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribeInvoices?.();
      setInvoiceList([]);
      setLoading(true);
      setLoadError(null);

      if (!user) {
        setUserId(null);
        setLoadError("Sign in to view and create your invoices.");
        setLoading(false);
        return;
      }

      setUserId(user.uid);
      unsubscribeInvoices = subscribeToUserInvoices(
        user.uid,
        (invoices) => {
          setInvoiceList(invoices);
          setLoading(false);
        },
        (error) => {
          setLoadError(
            error instanceof FirebaseError && error.code === "permission-denied"
              ? "Firestore access is blocked. Publish the owner-only rules from firestore.rules in Firebase Console."
              : "Could not load invoices. Check your connection and Firebase setup, then try again.",
          );
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeInvoices?.();
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: invoiceList.length,
      paid: invoiceList.filter((i) => i.status === "paid").length,
      unpaid: invoiceList.filter((i) => i.status === "unpaid").length,
      overdue: invoiceList.filter((i) => i.status === "overdue").length,
    }),
    [invoiceList],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoiceList.filter((invoice) => {
      const matchesFilter = filter === "all" || invoice.status === filter;
      const matchesQuery =
        q.length === 0 ||
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        invoice.client.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, invoiceList, query]);

  async function handleCreateInvoice(
    draft: Parameters<typeof createUserInvoice>[1],
  ) {
    if (!userId) throw new Error("Sign in before creating an invoice.");

    try {
      await createUserInvoice(userId, draft);
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "permission-denied"
      ) {
        throw new Error(
          "Firestore blocked this save. Publish the owner-only rules from firestore.rules in Firebase Console.",
        );
      }
      throw new Error(
        "Could not save this invoice. Check your connection and try again.",
      );
    }
  }

  return (
    <>
      <section className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
              Invoices
            </h1>
            <p className="mt-2 text-base text-neutral-500">
              {loading
                ? "Loading your invoices..."
                : `${counts.all} invoices in total, ${counts.unpaid + counts.overdue} waiting on payment.`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setInvoiceNumber(generateInvoiceNumber(invoiceList));
              setNewInvoiceOpen(true);
            }}
            disabled={loading || !userId || !!loadError}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Icon className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </Icon>
            New invoice
          </button>
        </div>

        {/* Toolbar: filters + search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {f.label}
                  <span
                    className={`tabular-nums ${active ? "text-blue-100" : "text-neutral-400"}`}
                  >
                    {counts[f.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="relative block sm:w-64">
            <span className="sr-only">Search invoices</span>
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400">
              {SearchPaths}
            </Icon>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoice or client"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </label>
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          {loading ? (
            <p className="px-6 py-16 text-center text-sm text-neutral-500">
              Loading your invoices...
            </p>
          ) : loadError ? (
            <p
              role="alert"
              className="px-6 py-16 text-center text-sm text-rose-700"
            >
              {loadError}
            </p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400">
                <Icon className="h-6 w-6">{DocumentPaths}</Icon>
              </span>
              <p className="text-sm font-medium text-neutral-900">
                {invoiceList.length === 0
                  ? "No invoices yet"
                  : "No invoices match this search"}
              </p>
              <p className="text-sm text-neutral-500">
                {invoiceList.length === 0
                  ? "Create your first invoice to see it here."
                  : "Try a different name, invoice number, or filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Invoice cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    {/* Top row */}
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          <Icon className="h-5 w-5">{DocumentPaths}</Icon>
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-neutral-950">
                            {invoice.invoiceNumber}
                          </p>

                          <p className="mt-0.5 text-xs text-neutral-400">
                            Invoice
                          </p>
                        </div>
                      </div>

                      <StatusPill status={invoice.status} />
                    </div>

                    {/* Client */}
                    <div className="relative mt-6">
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Billed to
                      </p>

                      <p className="mt-1 text-base font-semibold text-neutral-900">
                        {invoice.client}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="relative mt-6 rounded-2xl bg-neutral-50 p-4 transition-colors group-hover:bg-blue-50/60">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-neutral-400">
                            Total amount
                          </p>

                          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                            {formatAmount(invoice)}
                          </p>
                        </div>

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-200 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                          <Icon className="h-4 w-4">
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                          </Icon>
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="relative mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
                      <div>
                        <p className="text-xs text-neutral-400">Issued</p>

                        <p className="mt-1 text-sm font-medium text-neutral-700">
                          {formatDate(invoice.issuedOn)}
                        </p>
                      </div>

                      <div className="border-l border-neutral-100 pl-4">
                        <p className="text-xs text-neutral-400">Due date</p>

                        <p
                          className={`mt-1 text-sm font-medium ${
                            invoice.status === "overdue"
                              ? "text-red-600"
                              : "text-neutral-700"
                          }`}
                        >
                          {formatDate(invoice.dueOn)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom hover indicator */}
                    <div className="relative mt-5 flex items-center justify-between text-xs font-medium">
                      <span className="text-neutral-400 transition-colors group-hover:text-neutral-600">
                        View invoice
                      </span>

                      <span className="text-blue-600 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                        View →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <NewInvoiceModal
        open={newInvoiceOpen}
        invoiceNumber={invoiceNumber}
        onClose={() => setNewInvoiceOpen(false)}
        onCreate={async (draft) => {
          await handleCreateInvoice(draft);
          setNewInvoiceOpen(false);
        }}
      />
    </>
  );
}
