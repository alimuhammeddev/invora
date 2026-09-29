"use client";

import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { formatCurrencyAmount } from "../../../lib/currency";
import { firebaseAuth, firebaseSetupMessage } from "../../../lib/firebase";
import { useMinimumLoadingTime } from "../../../lib/useMinimumLoadingTime";
import {
  subscribeToUserInvoices,
  type InvoiceRecord,
} from "../../../lib/invoices";

type WeeklyPeriod = "current" | "previous";

function getInvoiceDate(invoice: InvoiceRecord) {
  const date = new Date(`${invoice.issuedOn}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function summarizeAmounts(invoices: InvoiceRecord[], currencies = invoices) {
  const totals = new Map<string, number>(
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

function AnalyticsSkeleton() {
  return (
    <section
      aria-label="Loading analytics"
      aria-busy="true"
      className="mx-auto space-y-7"
    >
      <header className="space-y-3">
        <div className="h-9 w-44 animate-pulse rounded bg-neutral-200" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-neutral-100" />
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl bg-blue-600 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-28 animate-pulse rounded bg-blue-400/70" />
              <div className="h-6 w-36 animate-pulse rounded bg-white/25" />
              <div className="h-4 w-32 animate-pulse rounded bg-blue-400/70" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-lg bg-white/15" />
          </div>
          <div className="mt-6 h-9 w-44 animate-pulse rounded bg-white/25" />
          <div className="mt-3 h-4 w-28 animate-pulse rounded bg-blue-400/70" />
          <div className="mt-7 grid h-16 grid-cols-7 items-end gap-2 border-b border-white/15 pb-1">
            {[0, 1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex h-full flex-col justify-end gap-2">
                <div
                  className="w-full animate-pulse rounded-t-sm bg-white/70"
                  style={{ height: `${24 + ((item * 19) % 60)}%` }}
                />
                <div className="mx-auto h-3 w-5 animate-pulse rounded bg-blue-400/70" />
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-blue-100 bg-white">
          <div className="h-1.5 bg-blue-600" />
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-blue-50" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-blue-100" />
                <div className="h-5 w-36 animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />
              </div>
            </div>
            <div className="h-10 w-40 animate-pulse rounded-lg bg-neutral-100" />
          </div>
          <div className="border-t border-blue-100 bg-blue-50/50 px-6 py-6 sm:px-8">
            <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
            <div className="mt-3 h-9 w-44 animate-pulse rounded bg-blue-100" />
            <div className="mt-5 flex items-center gap-2 border-t border-blue-100 pt-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-300" />
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="h-5 w-52 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-44 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-4 w-28 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="mt-6 grid h-44 grid-cols-5 items-end gap-3 border-b border-neutral-200 px-1 sm:gap-5">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
            >
              <div className="h-3 w-6 animate-pulse rounded bg-neutral-100" />
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full animate-pulse rounded-t-lg bg-blue-100"
                  style={{ height: `${28 + ((item * 17) % 55)}%` }}
                />
              </div>
              <div className="h-3 w-12 animate-pulse rounded bg-neutral-100" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-neutral-50" />
            </div>
          ))}
        </div>
      </section>

      <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-neutral-100" />
    </section>
  );
}

export default function AnalyticsPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useMinimumLoadingTime(loading);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [weeklyPeriod, setWeeklyPeriod] = useState<WeeklyPeriod>("current");
  const [revenueMonth, setRevenueMonth] = useState(() =>
    monthValue(new Date()),
  );

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
        setLoadError("Sign in to view your analytics.");
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
              : "Could not load your analytics. Check your connection and Firebase setup, then try again.",
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
  const today = new Date();
  const currentWeekStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  );
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);
  const selectedWeekStart =
    weeklyPeriod === "current" ? currentWeekStart : previousWeekStart;
  const selectedWeekEndExclusive =
    weeklyPeriod === "current" ? currentWeekEnd : currentWeekStart;
  const selectedWeekEnd = new Date(selectedWeekEndExclusive);
  selectedWeekEnd.setDate(selectedWeekEnd.getDate() - 1);
  const selectedWeekInvoices = paidInvoices.filter((invoice) => {
    const date = getInvoiceDate(invoice);
    return date && date >= selectedWeekStart && date < selectedWeekEndExclusive;
  });
  const weekdayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const selectedWeekActivity = weekdayNames.map((label, index) => {
    const dayStart = new Date(selectedWeekStart);
    dayStart.setDate(dayStart.getDate() + index);
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);
    return {
      label,
      count: selectedWeekInvoices.filter((invoice) => {
        const date = getInvoiceDate(invoice);
        return date && date >= dayStart && date < nextDay;
      }).length,
    };
  });
  const maxDailyPaidCount = Math.max(
    ...selectedWeekActivity.map(({ count }) => count),
    1,
  );
  const [revenueYear, revenueMonthNumber] = revenueMonth.split("-").map(Number);
  const monthStart = new Date(revenueYear, revenueMonthNumber - 1, 1);
  const nextMonthStart = new Date(revenueYear, revenueMonthNumber, 1);
  const monthPaidInvoices = paidInvoices.filter((invoice) => {
    const date = getInvoiceDate(invoice);
    return date && date >= monthStart && date < nextMonthStart;
  });
  const daysInRevenueMonth = new Date(
    revenueYear,
    revenueMonthNumber,
    0,
  ).getDate();
  const monthWeeklyActivity = Array.from(
    { length: Math.ceil(daysInRevenueMonth / 7) },
    (_, index) => {
      const firstDay = index * 7 + 1;
      const lastDay = Math.min(firstDay + 6, daysInRevenueMonth);
      const start = new Date(revenueYear, revenueMonthNumber - 1, firstDay);
      const end = new Date(revenueYear, revenueMonthNumber - 1, lastDay + 1);
      return {
        label: `Week ${index + 1}`,
        days: `${firstDay}-${lastDay}`,
        count: monthPaidInvoices.filter((invoice) => {
          const date = getInvoiceDate(invoice);
          return date && date >= start && date < end;
        }).length,
      };
    },
  );
  const maxMonthWeekCount = Math.max(
    ...monthWeeklyActivity.map(({ count }) => count),
    1,
  );
  const selectedWeekAmounts = summarizeAmounts(selectedWeekInvoices, invoices);
  const monthAmounts = summarizeAmounts(monthPaidInvoices, invoices);
  const rangeFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });
  const monthFormatter = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  });

  if (showSkeleton) return <AnalyticsSkeleton />;

  return (
    <section className="mx-auto space-y-7">
      <header>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-950 md:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-base text-neutral-500">
          Weekly and monthly paid invoice activity.
        </p>
      </header>

      {loadError ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
        >
          {loadError}
        </p>
      ) : (
        <>
          <section
            aria-label="Paid invoice value by period"
            className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <article className="overflow-hidden rounded-3xl bg-blue-600 p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-blue-100">
                    Weekly activity
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {weeklyPeriod === "current"
                      ? "Current week"
                      : "Previous week"}
                  </h2>
                  <p className="mt-1 text-xs text-white">
                    {rangeFormatter.format(selectedWeekStart)} –{" "}
                    {rangeFormatter.format(selectedWeekEnd)}
                  </p>
                </div>
                <div
                  role="group"
                  aria-label="Choose weekly analytics period"
                  className="flex shrink-0 rounded-lg bg-blue-800/40 p-1"
                >
                  {(["current", "previous"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      aria-pressed={weeklyPeriod === period}
                      onClick={() => setWeeklyPeriod(period)}
                      className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        weeklyPeriod === period
                          ? "bg-white text-blue-700"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {period === "current" ? "This week" : "Previous"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {(selectedWeekAmounts.length > 0
                  ? selectedWeekAmounts
                  : [{ currency: "NGN", amount: 0 }]
                ).map(({ currency, amount }) => (
                  <p
                    key={currency}
                    className="text-2xl font-semibold tabular-nums text-white sm:text-3xl"
                  >
                    {formatCurrencyAmount(amount, currency, "code")}
                  </p>
                ))}
              </div>
              <p className="mt-2 text-sm text-white">
                {selectedWeekInvoices.length} paid{" "}
                {selectedWeekInvoices.length === 1 ? "invoice" : "invoices"}
              </p>
              <div
                role="img"
                aria-label={`Paid invoice activity by day for the ${weeklyPeriod} week: ${selectedWeekActivity.map(({ label, count }) => `${label} ${count}`).join(", ")}`}
                className="mt-7 grid h-16 grid-cols-7 items-end gap-2 border-b border-white/15 pb-1"
              >
                {selectedWeekActivity.map(({ label, count }) => (
                  <div
                    key={label}
                    className="flex h-full flex-col justify-end gap-2"
                  >
                    <div
                      className="w-full rounded-t-sm bg-white"
                      style={{
                        height: count
                          ? `${Math.max((count / maxDailyPaidCount) * 100, 8)}%`
                          : "2px",
                      }}
                    />
                    <span className="text-center text-[10px] text-white">
                      {label.slice(0, 2)}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="overflow-hidden rounded-3xl border border-blue-100 bg-white">
              <div className="h-1.5 bg-blue-600" />
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-blue-700">
                      Month view
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                      Paid invoice value
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {monthFormatter.format(monthStart)}
                    </p>
                  </div>
                </div>
                <label className="block text-xs font-medium text-neutral-600">
                  Choose month
                  <input
                    type="month"
                    value={revenueMonth}
                    onChange={(event) => {
                      if (event.target.value)
                        setRevenueMonth(event.target.value);
                    }}
                    className="mt-1 block h-10 rounded-lg border border-blue-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <div className="border-t border-blue-100 bg-blue-50/50 px-6 py-6 sm:px-8">
                <p className="text-xs font-medium text-neutral-500">
                  Paid during {monthFormatter.format(monthStart)}
                </p>
                <div className="mt-3 space-y-2">
                  {(monthAmounts.length > 0
                    ? monthAmounts
                    : [{ currency: "NGN", amount: 0 }]
                  ).map(({ currency, amount }) => (
                    <p
                      key={currency}
                      className="text-2xl font-semibold tabular-nums text-blue-700 sm:text-3xl"
                    >
                      {formatCurrencyAmount(amount, currency, "code")}
                    </p>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-blue-100 pt-4 text-sm text-neutral-600">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  {monthPaidInvoices.length} paid{" "}
                  {monthPaidInvoices.length === 1 ? "invoice" : "invoices"}
                </div>
              </div>
            </article>
          </section>

          <section
            aria-labelledby="month-activity-title"
            className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="month-activity-title"
                  className="text-base font-semibold text-neutral-950"
                >
                  Paid invoices through the month
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Weekly count for {monthFormatter.format(monthStart)}
                </p>
              </div>
              <p className="text-xs text-neutral-500">
                {monthPaidInvoices.length} paid{" "}
                {monthPaidInvoices.length === 1 ? "invoice" : "invoices"}
              </p>
            </div>
            <div
              role="img"
              aria-label={`Paid invoices by week in ${monthFormatter.format(monthStart)}: ${monthWeeklyActivity.map(({ label, count }) => `${label} ${count}`).join(", ")}`}
              className="mt-6 grid h-44 items-end gap-3 border-b border-neutral-200 px-1 sm:gap-5"
              style={{
                gridTemplateColumns: `repeat(${monthWeeklyActivity.length}, minmax(0, 1fr))`,
              }}
            >
              {monthWeeklyActivity.map(({ label, days, count }) => (
                <div
                  key={label}
                  className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-medium tabular-nums text-neutral-600">
                    {count}
                  </span>
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-blue-600 transition-[height] duration-300"
                      style={{
                        height: count
                          ? `${Math.max((count / maxMonthWeekCount) * 100, 5)}%`
                          : "3px",
                      }}
                    />
                  </div>
                  <span className="text-center text-[10px] text-neutral-500 sm:text-xs">
                    {label}
                  </span>
                  <span className="-mt-1 text-[9px] text-neutral-400">
                    days {days}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <p className="text-sm text-neutral-500">
            Paid values are grouped by invoice issue date; payment dates are not
            recorded.
          </p>
        </>
      )}
    </section>
  );
}
