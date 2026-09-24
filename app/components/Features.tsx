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
      id="features"
      aria-labelledby="features-heading"
      className="border-t border-slate-100 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        {/* Header: heading on the left, intro on the right */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Features
            </span>

            <h2
              id="features-heading"
              className="mt-6 text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 md:text-4xl"
            >
              Everything you need to {" "}
              <span className="text-blue-600">get paid</span>
            </h2>
          </div>

          <p className="max-w-md md:text-lg text-base leading-8 text-slate-600">
            From the first draft to the final payment, every step of invoicing
            is handled in one place.
          </p>
        </div>

        <div className="mt-16 border-t border-slate-200 lg:mt-20">
          {features.map((feature, i) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden border-b border-slate-200"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-blue-600 transition-transform duration-500 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
              />

              <div className="relative grid grid-cols-2 items-center gap-x-10 gap-y-5 px-2 py-9 sm:px-8 lg:grid-cols-[7rem_1.1fr_1fr_auto] lg:py-12">
                <span
                  aria-hidden="true"
                  className="order-1 text-3xl font-semibold leading-none tracking-tighter tabular-nums text-slate-200 transition-colors duration-500 group-hover:text-blue-300 motion-reduce:transition-none md:text-5xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div
                  aria-hidden="true"
                  className="order-2 flex h-14 w-14 items-center justify-center justify-self-end rounded-full bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 transition-colors duration-500 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/30 motion-reduce:transition-none lg:order-4"
                >
                  {feature.icon}
                </div>

                <h3 className="order-3 col-span-2 text-xl font-semibold leading-tight tracking-tight text-slate-950 transition-colors duration-500 group-hover:text-white motion-reduce:transition-none lg:order-2 lg:col-span-1 lg:text-2xl">
                  {feature.title}
                </h3>

                <p className="order-4 col-span-2 max-w-md text-base leading-7 text-slate-600 transition-colors duration-500 group-hover:text-blue-100 motion-reduce:transition-none lg:order-3 lg:col-span-1">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};