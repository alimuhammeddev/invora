"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { formatCurrencyAmount } from "../../lib/currency";
import { firebaseAuth, firebaseSetupMessage } from "../../lib/firebase";
import {
  subscribeToUserInvoices,
  type InvoiceRecord,
} from "../../lib/invoices";

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

const ClockPaths = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>
);

const CheckPaths = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </>
);

function summarizeAmounts(
  invoices: InvoiceRecord[],
  currencies = invoices,
) {
  const totals = new Map(
    currencies.map((invoice) => [invoice.currency, 0] as const),
  );
  for (const invoice of invoices) {
    totals.set(
      invoice.currency,
      (totals.get(invoice.currency) ?? 0) + invoice.amount,
    );
  }

  return [...totals].map(([currency, amount]) => ({ currency, amount }));
}

/* ---------- Page ---------- */

export default function Dashboard() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
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
      setInvoices([]);
      setLoading(true);
      setLoadError(null);

      if (!user) {
        setLoadError("Sign in to view your invoice dashboard.");
        setLoading(false);
        return;
      }

      unsubscribeInvoices = subscribeToUserInvoices(
        user.uid,
        (records) => {
          setInvoices(records);
          setLoading(false);
        },
        (error) => {
          setLoadError(
            error instanceof FirebaseError && error.code === "permission-denied"
              ? "Firestore access is blocked. Publish the owner-only rules from firestore.rules in Firebase Console."
              : "Could not load your invoices. Check your connection and Firebase setup, then try again.",
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

  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "paid");
  const paid = {
    count: paidInvoices.length,
    amounts: summarizeAmounts(paidInvoices, invoices),
  };
  const unpaid = {
    count: unpaidInvoices.length,
    amounts: summarizeAmounts(unpaidInvoices, invoices),
  };
  const total = {
    count: invoices.length,
    amounts: summarizeAmounts(invoices),
  };
  const paidPercent = total.count
    ? Math.round((paid.count / total.count) * 100)
    : 0;
  const unpaidPercent = 100 - paidPercent;
  const statuses = [
    {
      label: "Unpaid invoices",
      note: "Waiting to be paid",
      count: unpaid.count,
      amounts: unpaid.amounts,
      href: "/dashboard/invoices?status=unpaid",
      cta: "View unpaid invoices",
      icon: ClockPaths,
      tile: "bg-amber-50 text-amber-600",
    },
    {
      label: "Paid invoices",
      note: "Received so far",
      count: paid.count,
      amounts: paid.amounts,
      href: "/dashboard/invoices?status=paid",
      cta: "View paid invoices",
      icon: CheckPaths,
      tile: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-base text-neutral-500">
            {loading ? "Loading your invoices..." : "Here is a quick summary of your invoices."}
          </p>
        </div>

        <Link
          href="/dashboard/invoices"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Icon className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </Icon>
          New invoice
        </Link>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-neutral-500">
          Loading your invoice data...
        </p>
      ) : loadError ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {loadError}
        </p>
      ) : invoices.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Icon className="h-6 w-6">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </Icon>
          </span>
          <h2 className="mt-5 text-lg font-semibold text-neutral-950">
            Your dashboard is ready
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Create your first invoice to start seeing totals, payment status, and account activity here.
          </p>
          <Link
            href="/dashboard/invoices"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Icon className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </Icon>
            Create your first invoice
          </Link>
        </section>
      ) : (
        <>
      {/* Overview: total, split between paid and unpaid */}
      <section
        aria-labelledby="overview-heading"
        className="rounded-4xl bg-blue-600 p-7 text-white sm:p-10"
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="overview-heading"
              className="text-sm font-medium text-blue-100"
            >
              Total invoiced
            </h2>
            <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tighter sm:text-7xl">
              {total.amounts.map(({ currency, amount }) => (
                <span key={currency} className="block text-4xl sm:text-5xl">
                  {formatCurrencyAmount(amount, currency, "code")}
                </span>
              ))}
            </p>
            <p className="mt-3 text-base text-blue-100">
              across {total.count} invoices
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4 sm:text-right">
            <p className="text-3xl font-semibold tabular-nums tracking-tight">
              {paidPercent}%
            </p>
            <p className="mt-0.5 text-sm text-blue-100">invoices paid</p>
          </div>
        </div>

        {/* Paid vs unpaid, sized by amount */}
        <div className="mt-10">
          <div
            role="img"
            aria-label={`${paidPercent}% of invoices are paid and ${unpaidPercent}% are unpaid`}
            className="flex h-4 gap-1"
          >
            <div
              style={{ flex: `${paid.count || 1} 1 0%` }}
              className="rounded-full bg-white"
            />
            <div
              style={{ flex: `${unpaid.count || 1} 1 0%` }}
              className="rounded-full bg-amber-300"
            />
          </div>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-sm font-medium text-blue-100">
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
                Paid
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
                {paid.amounts.map(({ currency, amount }) => (
                  <span key={currency} className="block text-lg">
                    {formatCurrencyAmount(amount, currency, "code")}
                  </span>
                ))}
              </dd>
              <dd className="mt-0.5 text-sm tabular-nums text-blue-100">
                {paid.count} invoices, {paidPercent}% of invoices
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm font-medium text-blue-100">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                Unpaid
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
                {unpaid.amounts.map(({ currency, amount }) => (
                  <span key={currency} className="block text-lg">
                    {formatCurrencyAmount(amount, currency, "code")}
                  </span>
                ))}
              </dd>
              <dd className="mt-0.5 text-sm tabular-nums text-blue-100">
                {unpaid.count} invoices, {unpaidPercent}% of invoices
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Status cards: each one opens the matching invoice list */}
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {statuses.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-7 transition-colors hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tile}`}
              >
                <Icon>{s.icon}</Icon>
              </span>
              <h2 className="text-sm font-medium text-neutral-600">
                {s.label}
              </h2>
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
              <div>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-950">
                  {s.amounts.map(({ currency, amount }) => (
                    <span key={currency} className="block text-base">
                      {formatCurrencyAmount(amount, currency, "code")}
                    </span>
                  ))}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{s.note}</p>
              </div>
              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tabular-nums tracking-tighter text-neutral-950">
                  {s.count}
                </span>
                <span className="text-sm text-neutral-500">invoices</span>
              </p>
            </div>

            <span className="mt-7 inline-flex items-center gap-1 border-t border-neutral-100 pt-5 text-sm font-medium text-blue-600 group-hover:text-blue-700">
              {s.cta}
              <Icon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
                <path d="m9 6 6 6-6 6" />
              </Icon>
            </span>
          </Link>
        ))}
      </div>

      {/* A little information */}
      <div className="flex items-start gap-3.5 rounded-2xl bg-neutral-50 p-5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-neutral-200">
          <Icon className="h-4 w-4">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </Icon>
        </span>
        <p className="text-sm leading-6 text-neutral-600">
          <span className="font-medium text-neutral-950">Good to know: </span>
          unpaid invoices are ones you have sent that have not been paid yet.
          Reminders go out automatically before and after the due date, so you
          do not have to chase them.
        </p>
      </div>
        </>
      )}
    </div>
  );
};