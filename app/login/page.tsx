"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

const brand = "Invora";

const highlights = [
  "Create professional invoices in seconds",
  "Reminders that send themselves",
  "See who has paid at a glance",
];

/* ---------- Icons ---------- */

function StrokeIcon({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const MailIcon = () => (
  <StrokeIcon>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7.5 8 5.5 8-5.5" />
  </StrokeIcon>
);

const LockIcon = () => (
  <StrokeIcon>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </StrokeIcon>
);

const EyeIcon = () => (
  <StrokeIcon>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </StrokeIcon>
);

const EyeOffIcon = () => (
  <StrokeIcon>
    <path d="M9.9 5.7A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.3 7.3A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1M3 3l18 18" />
    <path d="M10 10a3 3 0 0 0 4 4" />
  </StrokeIcon>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="h-3 w-3"
  >
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Spinner = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-4 w-4 animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="3"
      className="opacity-25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-950 placeholder:text-slate-400 transition focus:border-blue-600 focus:outline-none";

const iconStyles =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
  }

  return (
    <section className="bg-white p-3 lg:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)] lg:grid-cols-2">
        {/* Left: form */}
        <div className="relative flex flex-col px-4 py-6 sm:px-12 lg:px-16 lg:py-8">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Image src="/logo.png" alt="Logo" width={100} height={100}/>
          </Link>

          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-sm">
              <h1 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl">
                Welcome back
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Log in to your {brand} account to manage your invoices.
              </p>

              <button
                type="button"
                className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-7 flex items-center gap-4 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or log in with email
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Email address
                  </label>
                  <div className="group relative">
                    <span className={iconStyles}>
                      <MailIcon />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email address"
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-800"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="rounded text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="group relative">
                    <span className={iconStyles}>
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      className={`${inputStyles} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  Keep me signed in
                </label>

                <Link
                  href="/dashboard"
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Signing in
                    </>
                  ) : (
                    "Log in"
                  )}
                </Link>
              </form>

              <p className="mt-8 text-center text-sm text-slate-600">
                New to {brand}?{" "}
                <Link
                  href="/signup"
                  className="rounded font-semibold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: brand panel (large screens only) */}
        <div className="relative hidden overflow-hidden rounded-4xl bg-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium ring-1 ring-inset ring-white/25 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Welcome back
            </span>
          </div>

          <div className="relative pb-24">
            <h2 className="max-w-md text-balance font-semibold leading-[1.08] tracking-[-0.035em] md:text-3xl">
              Your invoices are waiting for you.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-blue-100">
              Pick up right where you left off and keep every payment moving.
            </p>

            <ul className="mt-9 space-y-4">
              {highlights.map((text) => (
                <li key={text} className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/25">
                    <CheckIcon />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Oversized faded wordmark, cropped by the bottom edge */}
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-8 select-none text-center text-[9rem] font-semibold leading-none tracking-[-0.06em] text-white/10 xl:text-[11rem]"
          >
            {brand}
          </p>
        </div>
      </div>
    </section>
  );
};