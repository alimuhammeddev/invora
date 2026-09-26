"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrencyAmount } from "../../../lib/currency";
import {
  getPublicInvoiceShare,
  type PublicInvoiceRecord,
} from "../../../lib/invoices";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const statusStyles: Record<PublicInvoiceRecord["status"], string> = {
  paid: "bg-blue-50 text-blue-700",
  unpaid: "bg-amber-50 text-amber-800",
  overdue: "bg-rose-50 text-rose-700",
};

export default function SharedInvoicePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [invoice, setInvoice] = useState<PublicInvoiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getPublicInvoiceShare(shareId)
      .then((sharedInvoice) => {
        if (!active) return;
        setInvoice(sharedInvoice);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load this invoice. Check the link and try again.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [shareId]);

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {loading ? (
          <p className="py-16 text-center text-sm text-neutral-500">
            Loading invoice...
          </p>
        ) : error ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : !invoice ? (
          <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
            <h1 className="text-lg font-semibold text-neutral-950">
              Invoice unavailable
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              This invoice link may be invalid.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Download className="h-4 w-4" />
                Download / Print PDF
              </button>
            </div>

            <article className="invoice-print mx-auto max-w-3xl border border-neutral-200 bg-white px-6 py-8 sm:px-10 sm:py-10">
              <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
                <div className="min-h-16">
                  {invoice.logoDataUrl && (
                    <Image
                      src={invoice.logoDataUrl}
                      alt={`${invoice.fromName} logo`}
                      width={100}
                      height={64}
                      unoptimized
                      className="object-contain object-left"
                    />
                  )}
                </div>
                <div className="text-right">
                  <h1 className="font-serif text-3xl text-neutral-950">
                    INVOICE
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {invoice.invoiceNumber}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyles[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </header>

              <section className="grid gap-6 border-b border-neutral-200 py-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    From
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-neutral-950">
                    {invoice.fromName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {invoice.fromAddress}
                  </p>
                </div>
                <div>
                  <h2 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Bill to
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-neutral-950">
                    {invoice.client}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {invoice.clientAddress}
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-5 border-b border-neutral-200 py-4 text-xs sm:grid-cols-3">
                <p>
                  <span className="mb-1 block text-[9px] font-semibold uppercase text-neutral-400">
                    Invoice number
                  </span>
                  {invoice.invoiceNumber}
                </p>
                <p>
                  <span className="mb-1 block text-[9px] font-semibold uppercase text-neutral-400">
                    Issued
                  </span>
                  {date(invoice.issuedOn)}
                </p>
                <p>
                  <span className="mb-1 block text-[9px] font-semibold uppercase text-neutral-400">
                    Due date
                  </span>
                  <span
                    className={
                      invoice.status === "overdue"
                        ? "font-medium text-rose-700"
                        : "text-neutral-700"
                    }
                  >
                    {date(invoice.dueOn)}
                  </span>
                </p>
              </div>

              <table className="mt-6 w-full text-left text-sm">
                <thead className="border-y border-neutral-300 text-[10px] uppercase text-neutral-500">
                  <tr>
                    <th className="py-3 font-medium">Description</th>
                    <th className="px-2 py-3 text-center font-medium">Qty</th>
                    <th className="px-2 py-3 text-right font-medium">Price</th>
                    <th className="py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoice.items.map((item, index) => (
                    <tr key={`${item.description}-${index}`}>
                      <td className="py-4 pr-3 text-neutral-800">
                        {item.description}
                      </td>
                      <td className="px-2 py-4 text-center tabular-nums text-neutral-600">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-4 text-right tabular-nums text-neutral-600">
                        {formatCurrencyAmount(item.price, invoice.currency)}
                      </td>
                      <td className="py-4 text-right font-medium tabular-nums text-neutral-900">
                        {formatCurrencyAmount(
                          item.quantity * item.price,
                          invoice.currency,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto mt-6 max-w-xs space-y-3 border-t border-neutral-200 pt-4 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatCurrencyAmount(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Tax</span>
                  <span>{formatCurrencyAmount(invoice.tax, invoice.currency)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-neutral-300 pt-3 font-semibold text-neutral-950">
                  <span>Total</span>
                  <span className="font-serif text-3xl">
                    {formatCurrencyAmount(invoice.amount, invoice.currency)}
                  </span>
                </div>
              </div>

              <section className="mt-8 border-t border-neutral-200 pt-5">
                <h2 className="text-sm font-semibold text-neutral-900">
                  Payment Information
                </h2>
                <div className="mt-3 grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
                  <p>
                    <span className="mb-1 block text-[10px] font-semibold uppercase text-neutral-400">
                      Bank
                    </span>
                    {invoice.bank || "Not provided"}
                  </p>
                  <p>
                    <span className="mb-1 block text-[10px] font-semibold uppercase text-neutral-400">
                      Account
                    </span>
                    {invoice.account || "Not provided"}
                  </p>
                </div>
              </section>

              <footer className="mt-8 flex items-center justify-between gap-4 border-t border-neutral-200 pt-4">
                <p className="text-xs text-neutral-500">
                  Invoice Generated From Invora
                </p>
                <Image
                  src="/logo.png"
                  alt="Invora"
                  width={120}
                  height={48}
                  className="h-8 w-auto object-contain"
                />
              </footer>
            </article>
          </>
        )}
      </div>
    </main>
  );
}