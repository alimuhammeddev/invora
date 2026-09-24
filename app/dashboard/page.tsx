import Link from "next/link";
import type { ReactNode } from "react";

/* ---------- Sample data (replace with your real numbers) ---------- */

const userName = "Alex";

const paid = { count: 31, amount: 36200 };
const unpaid = { count: 19, amount: 12480 };
const total = {
  count: paid.count + unpaid.count,
  amount: paid.amount + unpaid.amount,
};

const paidPercent = Math.round((paid.amount / total.amount) * 100);
const unpaidPercent = 100 - paidPercent;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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

/* ---------- Status cards ---------- */

const statuses = [
  {
    label: "Unpaid invoices",
    note: "Waiting to be paid",
    count: unpaid.count,
    amount: unpaid.amount,
    href: "/dashboard/invoices?status=unpaid",
    cta: "View unpaid invoices",
    icon: ClockPaths,
    tile: "bg-amber-50 text-amber-600",
  },
  {
    label: "Paid invoices",
    note: "Received so far",
    count: paid.count,
    amount: paid.amount,
    href: "/dashboard/invoices?status=paid",
    cta: "View paid invoices",
    icon: CheckPaths,
    tile: "bg-blue-50 text-blue-600",
  },
];

/* ---------- Page ---------- */

export default function Dashboard() {
  return (
    <div className="mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-base text-neutral-500">
            Here is a quick summary of your invoices.
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
              {money.format(total.amount)}
            </p>
            <p className="mt-3 text-base text-blue-100">
              across {total.count} invoices
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4 sm:text-right">
            <p className="text-3xl font-semibold tabular-nums tracking-tight">
              {paidPercent}%
            </p>
            <p className="mt-0.5 text-sm text-blue-100">collected so far</p>
          </div>
        </div>

        {/* Paid vs unpaid, sized by amount */}
        <div className="mt-10">
          <div
            role="img"
            aria-label={`${paidPercent}% of the total amount is paid and ${unpaidPercent}% is unpaid`}
            className="flex h-4 gap-1"
          >
            <div
              style={{ flex: `${paid.amount} 1 0%` }}
              className="rounded-full bg-white"
            />
            <div
              style={{ flex: `${unpaid.amount} 1 0%` }}
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
                {money.format(paid.amount)}
              </dd>
              <dd className="mt-0.5 text-sm tabular-nums text-blue-100">
                {paid.count} invoices, {paidPercent}% of the total
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm font-medium text-blue-100">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                Unpaid
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
                {money.format(unpaid.amount)}
              </dd>
              <dd className="mt-0.5 text-sm tabular-nums text-blue-100">
                {unpaid.count} invoices, {unpaidPercent}% of the total
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
                  {money.format(s.amount)}
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
    </div>
  );
};