import Link from "next/link";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 text-blue-600"
    >
      <path
        d="M3.5 8.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 py-24 lg:px-8">
        <div className="text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[5rem]">
            Create invoices. <span className="text-blue-600">Get paid faster.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-4xl text-lg leading-8 text-slate-600">
            Build a professional invoice in seconds, add your logo and colors,
            and send it straight to your client. Everything you need to manage
            your invoices, in one place.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white"
            >
              Create your first invoice
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              See how it works
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-slate-500">
            {[
              "No credit card required",
              "Free to start",
              "Your branding on every invoice",
            ].map((text) => (
              <li key={text} className="flex items-center gap-2">
                <CheckIcon />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};