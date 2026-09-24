import Link from "next/link";

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
      aria-labelledby="works-heading"
      className="relative overflow-hidden "
    >
      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-8 lg:py-32">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2
            id="works-heading"
            className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-gray-950 sm:text-5xl"
          >
            From blank page to <span className="text-blue-500">paid</span> in
            three steps
          </h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-400">
            No setup headaches and no learning curve. Start sending invoices the
            same day you sign up.
          </p>

          <Link
            href="/signup"
            className="mt-9 inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white "
          >
            Create your first invoice
          </Link>
        </div>

        {/* Right: connected timeline */}
        <ol className="relative space-y-5">
          <div
            aria-hidden="true"
            className="absolute bottom-10 left-6 top-10 w-px -translate-x-1/2 bg-linear-to-b from-blue-600 via-blue-600 to-transparent"
          />

          {steps.map((step, i) => (
            <li key={step.title} className="relative pl-18 sm:pl-20">
              <span className="absolute left-0 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
                {i + 1}
              </span>

              <div className="rounded-2xl bg-white/4 p-6 ring-1 transition duration-300 ring-blue-500/40 motion-reduce:transition-none sm:p-7">
                <h3 className="text-xl font-semibold tracking-tight text-gray-950">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-7 text-slate-400">
                  {step.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                  <ClockIcon />
                  {step.meta}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
