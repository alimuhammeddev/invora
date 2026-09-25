"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";

type LineItem = {
  id: number;
  description: string;
  quantity: number;
  price: number;
  priceInput: string;
};

export type InvoiceDraft = {
  client: string;
  issuedOn: string;
  dueOn: string;
  amount: number;
};

type NewInvoiceModalProps = {
  open: boolean;
  invoiceNumber: string;
  onClose: () => void;
  onCreate: (invoice: InvoiceDraft) => void;
};

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const today = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

export default function NewInvoiceModal({
  open,
  invoiceNumber,
  onClose,
  onCreate,
}: NewInvoiceModalProps) {
  const [fromName, setFromName] = useState("Acme Digital");
  const [fromAddress, setFromAddress] = useState("Lagos, Nigeria");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [client, setClient] = useState("ABC Limited");
  const [clientAddress, setClientAddress] = useState("Lagos, Nigeria");
  const [issuedOn, setIssuedOn] = useState(today);
  const [dueOn, setDueOn] = useState(today);
  const [bank, setBank] = useState("Example Bank");
  const [account, setAccount] = useState("1234567890");
  const [tax, setTax] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    {
      id: 1,
      description: "Website Design",
      quantity: 1,
      price: 300000,
      priceInput: "300000",
    },
    {
      id: 2,
      description: "Hosting",
      quantity: 1,
      price: 50000,
      priceInput: "50000",
    },
  ]);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!logoPreview) return;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusableSelector =
      'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        focusableSelector,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );
  const total = subtotal + tax;

  const updateItem = (id: number, changes: Partial<LineItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: current.reduce((largest, item) => Math.max(largest, item.id), 0) + 1,
        description: "",
        quantity: 1,
        price: 0,
        priceInput: "",
      },
    ]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate({ client: client.trim(), issuedOn, dueOn, amount: total });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-invoice-title"
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-neutral-50 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-medium uppercase text-blue-700">
              Accounts receivable
            </p>
            <h2
              id="new-invoice-title"
              className="mt-0.5 text-lg font-semibold text-neutral-950"
            >
              Create invoice
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invoice editor"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)]">
            <div className="space-y-6 border-b border-neutral-200 p-5 sm:p-7 lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Your business
                  <input
                    value={fromName}
                    onChange={(event) => setFromName(event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Business address
                  <input
                    value={fromAddress}
                    onChange={(event) => setFromAddress(event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </label>
                <div className="text-xs font-medium text-neutral-600 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <span>Logo (optional)</span>
                  <div className="mt-1.5 flex min-h-10 flex-wrap items-center gap-2">
                    <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-blue-300 hover:text-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) setLogoPreview(URL.createObjectURL(file));
                          event.currentTarget.value = "";
                        }}
                      />
                      {logoPreview ? "Change logo" : "Choose logo"}
                    </label>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        className="h-10 rounded-lg px-2 text-sm text-neutral-500 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <label className="block text-xs font-medium text-neutral-600">
                  Bill to
                  <input
                    value={client}
                    onChange={(event) => setClient(event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Client address
                  <input
                    value={clientAddress}
                    onChange={(event) => setClientAddress(event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Issue date
                  <input
                    type="date"
                    value={issuedOn}
                    onChange={(event) => setIssuedOn(event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Due date
                  <input
                    type="date"
                    value={dueOn}
                    onChange={(event) => setDueOn(event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </label>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Line items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-medium text-blue-700 hover:text-blue-900"
                  >
                    + Add item
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <fieldset
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_64px_100px_32px]"
                    >
                      <legend className="sr-only">Line item {index + 1}</legend>
                      <label className="col-span-3 block min-w-0 text-[11px] font-medium text-neutral-500 sm:col-span-1">
                        Description
                        <input
                          value={item.description}
                          onChange={(event) =>
                            updateItem(item.id, { description: event.target.value })
                          }
                          placeholder="Service or product"
                          className={`${fieldClassName} px-2`}
                          required
                        />
                      </label>
                      <label className="block text-[11px] font-medium text-neutral-500">
                        Qty
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[1-9][0-9]*"
                          value={item.quantity || ""}
                          onChange={(event) => {
                            const digits = event.target.value.replace(/\D/g, "");
                            updateItem(item.id, {
                              quantity: digits ? Number(digits) : 0,
                            });
                          }}
                          className={`${fieldClassName} px-2`}
                          required
                        />
                      </label>
                      <label className="block text-[11px] font-medium text-neutral-500">
                        Price (₦)
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]+([.][0-9]{0,2})?"
                          value={item.priceInput}
                          onChange={(event) => {
                            const cleaned = event.target.value.replace(/[^\d.]/g, "");
                            const decimalIndex = cleaned.indexOf(".");
                            const normalized =
                              decimalIndex === -1
                                ? cleaned
                                : `${cleaned.slice(0, decimalIndex)}.${cleaned
                                    .slice(decimalIndex + 1)
                                    .replace(/\./g, "")
                                    .slice(0, 2)}`;
                            const priceInput = normalized.startsWith(".")
                              ? `0${normalized}`
                              : normalized;
                            updateItem(item.id, {
                              priceInput,
                              price: Number(priceInput) || 0,
                            });
                          }}
                          className={`${fieldClassName} px-2`}
                          required
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setItems((current) =>
                            current.length > 1
                              ? current.filter((line) => line.id !== item.id)
                              : current,
                          )
                        }
                        aria-label={`Remove line item ${index + 1}`}
                        disabled={items.length === 1}
                        className="mb-0.5 flex h-9 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M5 7h14M10 11v6m4-6v6M6.5 7l.8 13h9.4l.8-13M9 7V4h6v3" />
                        </svg>
                      </button>
                    </fieldset>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Bank
                  <input
                    value={bank}
                    onChange={(event) => setBank(event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Account number
                  <input
                    inputMode="numeric"
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  Tax (₦)
                  <input
                    type="number"
                    min="0"
                    value={tax}
                    onChange={(event) => setTax(Math.max(0, Number(event.target.value)))}
                    className={fieldClassName}
                  />
                </label>
              </div>
            </div>

            <div className="bg-neutral-100 p-4 sm:p-7 lg:overflow-y-auto">
              <article className="mx-auto max-w-2xl bg-white px-5 py-6 shadow-sm ring-1 ring-neutral-200 sm:px-9 sm:py-9">
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex h-16 w-40 items-center">
                      {logoPreview && (
                        <Image
                          src={logoPreview}
                          alt={`${fromName} logo`}
                          width={100}
                          height={100}
                          unoptimized
                          className="object-contain object-left"
                        />
                      )}
                    </div>
                    <p className="font-semibold text-neutral-950">{fromName}</p>
                    <p className="mt-1 text-xs text-neutral-500">{fromAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-3xl tracking-wide text-neutral-950">
                      INVOICE
                    </p>
                    <p className="mt-1 text-sm font-medium text-blue-700">
                      #{invoiceNumber}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {issuedOn || "Issue date"}
                    </p>
                  </div>
                </header>

                <div className="mt-8 grid grid-cols-2 gap-4 border-y border-neutral-200 py-5 text-sm">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-neutral-400">
                      From
                    </p>
                    <p className="font-medium text-neutral-900">{fromName}</p>
                    <p className="mt-1 text-xs text-neutral-500">{fromAddress}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-neutral-400">
                      Bill to
                    </p>
                    <p className="font-medium text-neutral-900">
                      {client || "Client name"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {clientAddress || "Client address"}
                    </p>
                  </div>
                </div>

                <table className="mt-6 w-full table-fixed text-left text-xs">
                  <thead className="border-b border-neutral-300 text-[10px] uppercase text-neutral-500">
                    <tr>
                      <th className="w-[45%] py-2 font-semibold">Description</th>
                      <th className="w-[12%] py-2 text-center font-semibold">Qty</th>
                      <th className="w-[21%] py-2 text-right font-semibold">Price</th>
                      <th className="w-[22%] py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="wrap-break-word py-3 pr-2 text-neutral-800">
                          {item.description || "Item description"}
                        </td>
                        <td className="py-3 text-center tabular-nums text-neutral-600">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right tabular-nums text-neutral-600">
                          {formatNaira(item.price)}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums text-neutral-900">
                          {formatNaira(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="ml-auto mt-5 max-w-56 space-y-2 text-xs">
                  <div className="flex justify-between gap-4 text-neutral-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-neutral-500">
                    <span>Tax</span>
                    <span className="tabular-nums">{formatNaira(tax)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-neutral-300 pt-2 text-sm font-semibold text-neutral-950">
                    <span>Total</span>
                    <span className="tabular-nums">{formatNaira(total)}</span>
                  </div>
                </div>

                <div className="mt-7 border-t border-neutral-200 pt-5">
                  <h3 className="text-xs font-semibold text-neutral-900">
                    Payment Information
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600">Bank: {bank}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Account: {account}
                  </p>
                </div>

                <p className="mt-8 border-t border-neutral-100 pt-4 text-center font-serif text-sm italic text-neutral-500">
                  Thank you for your business.
                </p>
              </article>
            </div>
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-neutral-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg px-4 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Create invoice
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}