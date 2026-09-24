import Link from "next/link";

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 ring-1 ring-inset ring-blue-100">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="h-3 w-3 text-blue-600"
      >
        <path
          d="M3.5 8.5l3 3 6-6.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Backdrop: faint grid that fades out, plus soft blue glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[56px_56px] opacity-60 mask-[radial-gradient(ellipse_60%_55%_at_50%_40%,black,transparent)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 md:py-24 py-36 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            Simple invoicing for modern businesses
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[5rem]">
            Create invoices.{" "}
            <span className="text-blue-600">Get paid faster.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-4xl md:text-lg text-base leading-8 text-slate-600">
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
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="ml-0.5 h-2.5 w-2.5"
                  fill="currentColor"
                >
                  <path d="M4 2.8v10.4a.6.6 0 0 0 .92.5l8.2-5.2a.6.6 0 0 0 0-1L4.92 2.3A.6.6 0 0 0 4 2.8Z" />
                </svg>
              </span>
              See how it works
            </Link>
          </div>

          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
            {[
              "No credit card required",
              "Free to start",
              "Your branding on every invoice",
            ].map((text) => (
              <li key={text} className="flex items-center gap-2.5">
                <CheckIcon />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
