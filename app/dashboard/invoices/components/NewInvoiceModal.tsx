"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { NewInvoiceRecord } from "../../../../lib/invoices";

type LineItem = {
  id: number;
  description: string;
  quantity: number;
  price: number;
  priceInput: string;
};

type NewInvoiceModalProps = {
  open: boolean;
  invoiceNumber: string;
  onClose: () => void;
  onCreate: (invoice: NewInvoiceRecord) => Promise<void>;
};

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

async function compressLogo(file: File) {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Choose a logo smaller than 8 MB.");
  }

  const image = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  let currentScale = scale;

  try {
    for (let attempt = 0; attempt < 7; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.width * currentScale));
      canvas.height = Math.max(1, Math.round(image.height * currentScale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the selected logo.");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const quality = Math.max(0.4, 0.82 - attempt * 0.07);
      const dataUrl = canvas.toDataURL("image/webp", quality);
      if (dataUrl.length <= 280_000) return dataUrl;
      currentScale *= 0.8;
    }
  } finally {
    image.close();
  }

  throw new Error(
    "This logo could not be compressed small enough. Choose a simpler image.",
  );
}

export default function NewInvoiceModal({
  open,
  invoiceNumber,
  onClose,
  onCreate,
}: NewInvoiceModalProps) {
  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [client, setClient] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issuedOn, setIssuedOn] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [tax, setTax] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "", quantity: 0, price: 0, priceInput: "" },
  ]);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!logoPreview) return;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => {
    if (!open) return;
    setFromName("");
    setFromAddress("");
    setLogoPreview(null);
    setLogoFile(null);
    setClient("");
    setClientEmail("");
    setClientAddress("");
    setIssuedOn("");
    setDueOn("");
    setBank("");
    setAccount("");
    setTax("");
    setSaveError(null);
    setItems([
      { id: 1, description: "", quantity: 0, price: 0, priceInput: "" },
    ]);
  }, [open]);

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
      const focusable =
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector);
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
  const taxAmount = Number(tax) || 0;
  const total = subtotal + taxAmount;

  const updateItem = (id: number, changes: Partial<LineItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id:
          current.reduce((largest, item) => Math.max(largest, item.id), 0) + 1,
        description: "",
        quantity: 0,
        price: 0,
        priceInput: "",
      },
    ]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const logoDataUrl = logoFile ? await compressLogo(logoFile) : undefined;
      await onCreate({
        invoiceNumber,
        fromName: fromName.trim(),
        fromAddress: fromAddress.trim(),
        ...(logoDataUrl ? { logoDataUrl } : {}),
        client: client.trim(),
        clientEmail: clientEmail.trim(),
        clientAddress: clientAddress.trim(),
        issuedOn,
        dueOn,
        items: items.map(({ description, quantity, price }) => ({
          description: description.trim(),
          quantity,
          price,
        })),
        subtotal,
        tax: taxAmount,
        amount: total,
        currency: "NGN",
        bank: bank.trim(),
        account: account.trim(),
      });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save this invoice. Please try again.",
      );
    } finally {
      setSaving(false);
    }
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
        className="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-neutral-50 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 sm:px-7">
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
                          if (file) {
                            if (!file.type.startsWith("image/")) {
                              setSaveError(
                                "Choose an image file for the logo.",
                              );
                            } else {
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
                              setSaveError(null);
                            }
                          }
                          event.currentTarget.value = "";
                        }}
                      />
                      {logoPreview ? "Change logo" : "Choose logo"}
                    </label>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                        }}
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
                  Client email
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="client@example.com"
                    className={fieldClassName}
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
                            updateItem(item.id, {
                              description: event.target.value,
                            })
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
                            const digits = event.target.value.replace(
                              /\D/g,
                              "",
                            );
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
                            const cleaned = event.target.value.replace(
                              /[^\d.]/g,
                              "",
                            );
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
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]+([.][0-9]{0,2})?"
                    value={tax}
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
                      setTax(
                        normalized.startsWith(".")
                          ? `0${normalized}`
                          : normalized,
                      );
                    }}
                    className={fieldClassName}
                  />
                </label>
              </div>
            </div>

            <div className="bg-neutral-100 p-4 sm:p-7 lg:overflow-y-auto">
              <article className="mx-auto max-w-2xl overflow-hidden border border-neutral-200 bg-white">
                <div className="h-1 bg-blue-700" />
                <div className="px-5 py-6 sm:px-8 sm:py-8">
                  <header className="flex items-start justify-between gap-5 border-b border-neutral-200 pb-5">
                    <div className="min-h-12">
                      {logoPreview && (
                        <Image
                          src={logoPreview}
                          alt={`${fromName || "Business"} logo`}
                          width={144}
                          height={64}
                          unoptimized
                          className="h-14 w-36 object-contain object-left"
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl text-neutral-950">
                        INVOICE
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        #{invoiceNumber}
                      </p>
                    </div>
                  </header>

                  <section className="grid gap-5 border-b border-neutral-200 py-5 sm:grid-cols-2">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                        From
                      </p>
                      <p className="mt-2 text-xs font-semibold text-neutral-950">
                        {fromName || "Your business"}
                      </p>
                      <p className="mt-1 text-[10px] text-neutral-500">
                        {fromAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                        Bill to
                      </p>
                      <p className="mt-2 text-xs font-semibold text-neutral-950">
                        {client || "Client name"}
                      </p>
                      <p className="mt-1 text-[10px] text-neutral-500">
                        {clientAddress || "Client address"}
                      </p>
                      {clientEmail && (
                        <p className="mt-1 text-[10px] text-neutral-500">
                          {clientEmail}
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="grid grid-cols-2 gap-4 border-b border-neutral-200 py-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[8px] font-semibold uppercase text-neutral-400">
                        Invoice number
                      </p>
                      <p className="mt-1 text-[10px] text-neutral-700">
                        #{invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-semibold uppercase text-neutral-400">
                        Issued
                      </p>
                      <p className="mt-1 text-[10px] text-neutral-700">
                        {issuedOn || "Issue date"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-semibold uppercase text-neutral-400">
                        Due date
                      </p>
                      <p className="mt-1 text-[10px] text-neutral-700">
                        {dueOn || "Due date"}
                      </p>
                    </div>
                  </section>

                  <div className="mt-5 flex items-center justify-between">
                    <h3 className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Description
                    </h3>
                    <span className="text-[9px] text-neutral-400">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <table className="mt-2 w-full table-fixed text-left text-[10px]">
                    <thead className="border-y border-neutral-300 text-[8px] uppercase tracking-wide text-neutral-500">
                      <tr>
                        <th className="w-[46%] py-2 font-medium">
                          Description
                        </th>
                        <th className="w-[12%] px-1 py-2 text-center font-medium">
                          Qty
                        </th>
                        <th className="w-[20%] px-1 py-2 text-right font-medium">
                          Price
                        </th>
                        <th className="w-[22%] py-2 text-right font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="wrap-break-word py-3 pr-1 text-neutral-800">
                            {item.description || "Item description"}
                          </td>
                          <td className="px-1 py-3 text-center tabular-nums text-neutral-600">
                            {item.quantity || ""}
                          </td>
                          <td className="px-1 py-3 text-right tabular-nums text-neutral-600">
                            {item.priceInput ? formatNaira(item.price) : ""}
                          </td>
                          <td className="py-3 text-right font-medium tabular-nums text-neutral-900">
                            {item.quantity && item.priceInput
                              ? formatNaira(item.quantity * item.price)
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="ml-auto mt-4 max-w-56 space-y-2 border-t border-neutral-200 pt-3 text-[10px]">
                    <div className="flex justify-between gap-3 text-neutral-500">
                      <span>Subtotal</span>
                      <span>{formatNaira(subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-neutral-500">
                      <span>Tax</span>
                      <span>{formatNaira(taxAmount)}</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-neutral-300 pt-2 font-semibold text-neutral-950">
                      <span>Total</span>
                      <span className="font-serif text-xl tabular-nums">
                        {formatNaira(total)}
                      </span>
                    </div>
                  </div>

                  <section className="mt-6 grid gap-3 border-t border-neutral-200 pt-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-[9px] font-semibold uppercase text-neutral-400">
                        Payment information
                      </h3>
                      <p className="mt-2 text-[10px] text-neutral-600">
                        Bank: {bank || "Not provided"}
                      </p>
                      <p className="mt-1 text-[10px] text-neutral-600">
                        Account: {account || "Not provided"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[9px] font-semibold uppercase text-neutral-400">
                        Due date
                      </p>
                      <p className="mt-2 text-[10px] text-neutral-700">
                        {dueOn || "Due date"}
                      </p>
                    </div>
                  </section>

                  <footer className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-200 pt-4">
                    <p className="text-[9px] text-neutral-500">
                      Invoice Generated From Invora
                    </p>
                    <Image
                      src="/logo.png"
                      alt="Invora"
                      width={120}
                      height={48}
                      className="h-7 w-auto object-contain"
                    />
                  </footer>
                </div>
              </article>
            </div>
          </div>

          {saveError && (
            <p
              role="alert"
              className="shrink-0 border-t border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 sm:px-7"
            >
              {saveError}
            </p>
          )}
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-neutral-200 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg px-4 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? "Saving invoice..." : "Create invoice"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
