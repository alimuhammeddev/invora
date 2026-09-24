"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

/* ---------- Sample data (replace with your real invoices) ---------- */

type Status = "paid" | "unpaid" | "overdue";

type Invoice = {
  id: string;
  client: string;
  issuedOn: string;
  dueOn: string;
  amount: number;
  status: Status;
};

const invoices: Invoice[] = [
  { id: "INV-1042", client: "Northwind Traders", issuedOn: "2026-09-01", dueOn: "2026-09-15", amount: 2400, status: "paid" },
  { id: "INV-1041", client: "Bluebird Studio", issuedOn: "2026-09-02", dueOn: "2026-09-16", amount: 1180, status: "paid" },
  { id: "INV-1040", client: "Marlowe & Co.", issuedOn: "2026-08-28", dueOn: "2026-09-11", amount: 3650, status: "overdue" },
  { id: "INV-1039", client: "Ferro Logistics", issuedOn: "2026-09-05", dueOn: "2026-09-19", amount: 940, status: "unpaid" },
  { id: "INV-1038", client: "Hearthstone Realty", issuedOn: "2026-08-20", dueOn: "2026-09-03", amount: 5200, status: "overdue" },
  { id: "INV-1037", client: "Cobalt Interiors", issuedOn: "2026-09-10", dueOn: "2026-09-24", amount: 1750, status: "unpaid" },
  { id: "INV-1036", client: "Northwind Traders", issuedOn: "2026-08-12", dueOn: "2026-08-26", amount: 2400, status: "paid" },
  { id: "INV-1035", client: "Ferro Logistics", issuedOn: "2026-09-14", dueOn: "2026-09-28", amount: 820, status: "unpaid" },
  { id: "INV-1034", client: "Willow Grove Cafe", issuedOn: "2026-08-30", dueOn: "2026-09-13", amount: 615, status: "paid" },
  { id: "INV-1033", client: "Marlowe & Co.", issuedOn: "2026-09-16", dueOn: "2026-09-30", amount: 3650, status: "unpaid" },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

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
            ? "bg-blue-600"
            : status === "unpaid"
              ? "bg-amber-500"
              : "bg-red-600"
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

  const counts = useMemo(
    () => ({
      all: invoices.length,
      paid: invoices.filter((i) => i.status === "paid").length,
      unpaid: invoices.filter((i) => i.status === "unpaid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesFilter = filter === "all" || invoice.status === filter;
      const matchesQuery =
        q.length === 0 ||
        invoice.id.toLowerCase().includes(q) ||
        invoice.client.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <section className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
            Invoices
          </h1>
          <p className="mt-2 text-base text-neutral-500">
            {counts.all} invoices in total, {counts.unpaid + counts.overdue} waiting on payment.
          </p>
        </div>

        <Link
          href="/dashboard/invoices/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Icon className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </Icon>
          New invoice
        </Link>
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400">
              <Icon className="h-6 w-6">{DocumentPaths}</Icon>
            </span>
            <p className="text-sm font-medium text-neutral-900">
              No invoices match this search
            </p>
            <p className="text-sm text-neutral-500">
              Try a different name, invoice number, or filter.
            </p>
          </div>
        ) : (
          <>
            {/* Column headings, desktop only */}
            <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.9fr] gap-4 border-b border-neutral-100 px-6 py-3 text-xs font-medium text-neutral-400 sm:grid">
              <span>Invoice</span>
              <span>Client</span>
              <span>Issued</span>
              <span>Due</span>
              <span className="text-right">Amount</span>
            </div>

            <ul className="divide-y divide-neutral-100">
              {filtered.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="grid grid-cols-2 gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:bg-blue-50 sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.9fr] sm:items-center"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-neutral-950">
                      {invoice.id}
                    </span>

                    <span className="text-sm text-neutral-600 sm:order-none">
                      {invoice.client}
                    </span>

                    <span className="order-4 text-sm tabular-nums text-neutral-500 sm:order-none">
                      {formatDate(invoice.issuedOn)}
                    </span>

                    <span className="order-5 text-sm tabular-nums text-neutral-500 sm:order-none">
                      {formatDate(invoice.dueOn)}
                    </span>

                    <span className="order-2 flex items-center justify-end gap-3 text-right sm:order-none">
                      <StatusPill status={invoice.status} />
                      <span className="text-sm font-semibold tabular-nums text-neutral-950">
                        {money.format(invoice.amount)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}