import Link from "next/link";
import type { CSSProperties } from "react";

const steps = [
  {
    title: "Create your invoice",
    description:
      "Add your client and line items. Your logo and colors are applied automatically, and the totals work themselves out.",
    meta: "Under a minute",
  },
  {
    title: "Send it to your client",
    description:
      "Email it straight from the app or share a link. Your client receives a clean, professional invoice they can open anywhere.",
    meta: "One click",
  },
  {
    title: "Get paid faster",
    description:
      "Reminders follow up for you, and you see the moment an invoice is marked as paid. No chasing, no guesswork.",
    meta: "Runs on autopilot",
  },
];

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.8V8l2.2 1.4" />
    </svg>
  );
}

export default function Works() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="works-heading"
      className="relative overflow-x-clip border-y border-slate-200 bg-slate-50"
    >
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-32">
        {/* Left: stays in view while the cards stack up (desktop) */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            How it works
          </span>

          <h2
            id="works-heading"
            className="mt-6 text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 md:text-4xl"
          >
            From blank page to <span className="text-blue-600">paid</span> in
            three steps
          </h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
            No setup headaches and no learning curve. Start sending invoices the
            same day you sign up.
          </p>

          <Link
            href="/signup"
            className="mt-9 inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white"
          >
            Create your first invoice
          </Link>
        </div>

        {/* Right: cards that stack on top of each other as you scroll */}
        <ol className="min-w-0 space-y-5 sm:space-y-6 lg:space-y-10">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;

            return (
              <li
                key={step.title}
                style={
                  {
                    "--top-sm": `${5.5 + i * 0.75}rem`,
                    "--top-lg": `${7 + i * 1.5}rem`,
                  } as CSSProperties
                }
                className={`relative top-(--top-sm) flex min-h-68 flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 sm:min-h-76 sm:rounded-4xl sm:p-10 lg:top-(--top-lg) lg:min-h-88 [@media(min-height:620px)]:sticky ${
                  last
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-950 ring-1 ring-slate-200"
                }`}
              >
                {/* Oversized number watermark, smaller on phones so it never crowds the text */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-6 -right-1 select-none text-[8rem] font-semibold leading-none tracking-tighter sm:-bottom-10 sm:-right-2 sm:text-[13rem] ${
                    last ? "text-white/10" : "text-slate-100"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold tabular-nums ${
                      last
                        ? "bg-white/15 text-white ring-1 ring-inset ring-white/25"
                        : "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100"
                    }`}
                  >
                    Step {i + 1}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      last ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    <ClockIcon />
                    {step.meta}
                  </span>
                </div>

                <div className="relative mt-8 max-w-md sm:mt-10">
                  <h3 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                    {step.title}
                  </h3>
                  <p
                    className={`mt-3 text-[15px] leading-7 sm:mt-4 sm:text-lg sm:leading-8 ${
                      last ? "text-blue-100" : "text-slate-600"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};