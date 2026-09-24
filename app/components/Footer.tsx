import Image from "next/image";
import Link from "next/link";

const brand = "Invora";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const linkStyles =
  "text-sm text-slate-600 transition-colors hover:text-blue-600 focus:outline-none focus-visible:text-blue-600 focus-visible:underline focus-visible:underline-offset-4";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-50">
      <div className="relative mx-auto max-w-7xl px-6 pt-20 lg:px-8 lg:pt-24">
        {/* Closing call to action */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-slate-200 pb-16 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 md:text-3xl">
              Ready to get <span className="text-blue-600">paid faster?</span>
            </h2>
            <p className="mt-3 md:text-lg text-base leading-8 text-slate-600">
              Create your first invoice in under a minute. No credit card
              required.
            </p>
          </div>

          <Link
            href="/signup"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            Create your first invoice
          </Link>
        </div>

        {/* Brand + link columns */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-7 text-slate-600">
              Professional invoicing for modern businesses. Create, send and
              track every invoice in one simple place.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold text-slate-950">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkStyles}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 py-8 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {brand}. All rights reserved.
          </p>
          <p>Built for people who would rather not chase payments.</p>
        </div>
      </div>

      {/* wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden text-center"
      >
        <p className="translate-y-[22%] bg-linear-to-b from-slate-900/9 to-transparent bg-clip-text text-[clamp(4.5rem,19vw,17rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-transparent">
          {brand}
        </p>
      </div>
    </footer>
  );
}
