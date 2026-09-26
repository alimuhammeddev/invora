"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useToast } from "../components/ToastProvider";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  firebaseAuth,
  firebaseSetupMessage,
  getFirebaseAuthErrorMessage,
} from "../../lib/firebase";
import { activateUserAccount, isAccountDeleted } from "../../lib/userAccount";

const brand = "Invora";

const highlights = [
  "Create professional invoices in seconds",
  "Send invoices directly to your clients",
  "Track payments without the spreadsheets",
];

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

const UserIcon = () => (
  <StrokeIcon>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.2-5.5 7-5.5s6.2 1.9 7 5.5" />
  </StrokeIcon>
);

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
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3 w-3">
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

export default function Signup() {
  const router = useRouter();
  const showToast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!firebaseAuth) {
      setError(firebaseSetupMessage);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      await updateProfile(credential.user, { displayName: name });
      await activateUserAccount(credential.user, name);
      showToast("Your account is ready");
      router.replace("/dashboard");
    } catch (authError) {
      if (
        typeof authError === "object" &&
        authError !== null &&
        "code" in authError &&
        authError.code === "auth/email-already-in-use"
      ) {
        try {
          const credential = await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password,
          );
          if (await isAccountDeleted(credential.user.uid)) {
            await activateUserAccount(credential.user, name);
            await updateProfile(credential.user, { displayName: name });
            showToast("Your account has been restored");
            router.replace("/dashboard");
          } else {
            await signOut(firebaseAuth);
            setError("An account with this email already exists. Log in instead.");
          }
        } catch {
          setError("We couldn't verify this account. Check the original password to restore a deleted account, or log in if the account is active.");
        }
      } else {
        setError(getFirebaseAuthErrorMessage(authError));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);

    if (!firebaseAuth) {
      setError(firebaseSetupMessage);
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithPopup(
        firebaseAuth,
        new GoogleAuthProvider(),
      );
      await activateUserAccount(credential.user);
      showToast("Signup Successfully");
      router.replace("/dashboard");
    } catch (authError) {
      setError(getFirebaseAuthErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white p-3 lg:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)] lg:grid-cols-2">
        {/* Left: Signup form */}
        <div className="relative flex flex-col px-4 py-6 sm:px-12 lg:px-16 lg:py-8">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Image src="/logo.png" alt="Invora" width={100} height={100} />
          </Link>

          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-sm">
              {/* Heading */}
              <h1 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl">
                Create your account
              </h1>

              <p className="mt-3 text-base leading-7 text-slate-600">
                Start creating professional invoices with {brand}.
              </p>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Spinner /> : <GoogleIcon />}
                {loading ? "Signing in" : "Continue with Google"}
              </button>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or sign up with email
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate={false}
              >
                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {error}
                  </div>
                )}

                {/* Full name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Full name
                  </label>

                  <div className="group relative">
                    <span className={iconStyles}>
                      <UserIcon />
                    </span>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Enter your full name"
                      className={inputStyles}
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <span className={iconStyles}>
                      <LockIcon />
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      placeholder="Create a password"
                      className={`${inputStyles} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Use at least 8 characters.
                  </p>
                </div>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
                  />

                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Creating account
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              {/* Login link */}
              <p className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="rounded font-semibold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Brand panel */}
        <div className="relative hidden overflow-hidden rounded-4xl bg-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          {/* Background grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
          </div>

          {/* Badge */}
          <div className="relative">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium ring-1 ring-inset ring-white/25 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Simple invoicing, made better
            </span>
          </div>

          {/* Main content */}
          <div className="relative pb-24">
            <h2 className="max-w-md text-balance font-semibold leading-[1.08] tracking-[-0.035em] md:text-3xl">
              Everything you need to get paid.
            </h2>

            <p className="mt-5 max-w-md text-lg leading-8 text-blue-100">
              Create, send and track professional invoices without the
              unnecessary complexity.
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

          {/* Faded wordmark */}
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
}
