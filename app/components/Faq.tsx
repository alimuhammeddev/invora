"use client";

import Link from "next/link";
import { useId, useState } from "react";

const faqs = [
  {
    question: "Is it really free to start?",
    answer:
      "Yes. You can create and send invoices on the free plan without adding a credit card. Upgrade only when you need more.",
  },
  {
    question: "Can I add my logo and brand colors?",
    answer:
      "Yes. Upload your logo and choose your colors once, and they are applied to every invoice you create from then on.",
  },
  {
    question: "How do payment reminders work?",
    answer:
      "You choose when reminders go out, for example before the due date, on the day itself and after it passes. They send automatically until the invoice is paid.",
  },
  {
    question: "Can I bill clients in different currencies?",
    answer:
      "Yes. Pick a currency for each invoice, so you can bill clients anywhere without converting amounts by hand.",
  },
  {
    question: "How do I know when an invoice has been paid?",
    answer:
      "Your dashboard shows every invoice as paid, pending or overdue, and you are notified as soon as a status changes.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. There are no contracts, and you can cancel from your account settings whenever you like. Your past invoices stay available to download.",
  },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${className}`}
    >
      <path d="M6 3.5L10.5 8 6 12.5" />
    </svg>
  );
}

export default function FAQ() {
  const [active, setActive] = useState(0);
  const baseId = useId();

  return (
    <section
      aria-labelledby="faq-heading"
      className="relative overflow-hidden bg-white"
    >
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-8 lg:py-32">
        {/* Left: heading + question list */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Frequently Asked Questions
          </span>
          <h2
            id="faq-heading"
            className="text-2xl mt-6 font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 md:text-4xl"
          >
            Questions, <span className="text-blue-600">answered</span>
          </h2>
          <p className="mt-5 max-w-md md:text-lg text-base leading-8 text-slate-600">
            Everything you need to know before you send your first invoice.
          </p>

          <div className="mt-10 space-y-1.5">
            {faqs.map((faq, i) => {
              const open = active === i;
              const answerId = `${baseId}-answer-${i}`;

              return (
                <div
                  key={faq.question}
                  className={`rounded-2xl transition duration-300 motion-reduce:transition-none ${
                    open
                      ? "bg-white ring-1 ring-blue-200"
                      : "ring-1 ring-transparent hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => setActive(i)}
                    className="flex w-full items-center gap-4 rounded-2xl p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:p-5"
                  >
                    <span
                      className={`text-sm font-semibold tabular-nums transition-colors duration-300 motion-reduce:transition-none ${
                        open ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {pad(i)}
                    </span>
                    <span
                      className={`flex-1 text-base font-medium transition-colors duration-300 motion-reduce:transition-none sm:text-lg ${
                        open ? "text-slate-950" : "text-slate-600"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <Chevron
                      className={`transition duration-300 motion-reduce:transition-none lg:opacity-0 ${
                        open
                          ? "rotate-90 text-blue-600 lg:rotate-0 lg:opacity-100"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Inline answer: animates open on mobile, read by screen readers on desktop */}
                  <div
                    id={answerId}
                    role="region"
                    aria-hidden={!open}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none lg:sr-only ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-5 pl-13 text-[15px] leading-7 text-slate-600 sm:px-5 sm:pl-15">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: large answer panel (desktop only) */}
        <div
          aria-hidden="true"
          className="relative hidden min-h-120 flex-col justify-between overflow-hidden rounded-4xl bg-blue-600 p-12 text-white lg:sticky lg:top-24 lg:flex lg:self-start"
        >
          {/* Oversized number watermark */}
          {faqs.map((faq, i) => (
            <span
              key={faq.question}
              className={`pointer-events-none absolute -right-2 -top-6 select-none text-[13rem] font-semibold leading-none tracking-tighter text-white/10 transition-opacity duration-500 motion-reduce:transition-none ${
                active === i ? "opacity-100" : "opacity-0"
              }`}
            >
              {pad(i)}
            </span>
          ))}

          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium tabular-nums ring-1 ring-inset ring-white/25">
              Question {active + 1} of {faqs.length}
            </span>

            {/* Answers stacked in one grid cell so they crossfade */}
            <div className="mt-10 grid">
              {faqs.map((faq, i) => (
                <div
                  key={faq.question}
                  className={`col-start-1 row-start-1 transition duration-500 motion-reduce:transition-none ${
                    active === i
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-3 opacity-0"
                  }`}
                >
                  <h3 className="text-2xl font-semibold leading-tight tracking-tight">
                    {faq.question}
                  </h3>
                  <p className="mt-5 text-lg leading-8 text-blue-100">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="relative mt-12 flex gap-1.5">
            {faqs.map((faq, i) => (
              <span
                key={faq.question}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 motion-reduce:transition-none ${
                  active === i ? "bg-white" : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
