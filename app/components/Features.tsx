import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      {children}
    </svg>
  );
}

const DocumentIcon = () => (
  <Icon>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Icon>
);

const SparkleIcon = () => (
  <Icon>
    <path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9L11 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </Icon>
);

const BellIcon = () => (
  <Icon>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Z" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icon>
);

const ChartIcon = () => (
  <Icon>
    <path d="M5 20v-9M12 20V4M19 20v-6" />
  </Icon>
);

const features: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <DocumentIcon />,
    title: "Professional invoices in seconds",
    description:
      "Add line items, taxes and discounts and watch the totals update as you type. No spreadsheets, no formatting.",
  },
  {
    icon: <SparkleIcon />,
    title: "Your brand on every invoice",
    description:
      "Upload your logo and pick your colors so every invoice looks like it came from you.",
  },
  {
    icon: <BellIcon />,
    title: "Reminders that send themselves",
    description:
      "Set the schedule once and stop chasing late payments by hand.",
  },
  {
    icon: <ChartIcon />,
    title: "See who has paid at a glance",
    description:
      "Know what is paid, pending or overdue without opening a single invoice.",
  },
];

export default function Features() {
  return (
    <section
      aria-labelledby="features-heading"
      className="relative overflow-hidden border-t border-slate-100 bg-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-90 w-180 -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl"
          >
            Everything you need to{" "}
            <span className="text-blue-600">get paid</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            From the first draft to the final payment, every step of invoicing
            is handled in one place.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:ring-blue-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 motion-reduce:transition-none">
                  {feature.icon}
                </div>

                <h3 className="mt-7 text-lg font-semibold leading-snug tracking-tight text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
