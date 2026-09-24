"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, X, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

// Premium easing shared by all menu transitions
const EASE = "cubic-bezier(0.16,1,0.3,1)";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll awareness
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape to close + lock scroll
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Close on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => e.matches && setIsOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        {/* Nav pill */}
        <nav
          className={`relative flex h-16 items-center rounded-full border px-4 transition-all duration-500 sm:px-6 ${
            scrolled
              ? "border-gray-200 bg-white"
              : "border-gray-200 bg-white"
          } backdrop-blur-2xl`}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2.5"
          >
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </Link>

          {/* Centered segmented links */}
          <div className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex">
            <div className="pointer-events-auto flex items-center gap-1">
              {links.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-600"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-blue-600"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Create invoice
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-950/8 text-gray-950 transition hover:bg-gray-950/5 lg:hidden"
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      {/* Full-screen mobile menu — stays mounted, animates both ways */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 flex flex-col bg-white backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          isOpen
            ? "visible pointer-events-auto translate-y-0 opacity-100"
            : "invisible pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          style={{ transitionDelay: isOpen ? "120ms" : "0ms" }}
          className={`absolute right-4 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gray-950/8 bg-white text-gray-950 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-950 hover:text-white sm:right-6 ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <X size={20} />
        </button>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-8 pt-24 sm:px-12">
          <nav className="flex flex-col gap-2">
            {links.map(({ label, href }, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: isOpen ? `${160 + i * 60}ms` : "0ms" }}
                className={`group flex items-baseline gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                <span className="font-mono text-xs text-gray-400">
                  0{i + 1}
                </span>
                <span className="text-3xl font-semibold tracking-tight text-gray-400 transition-colors duration-300 group-hover:text-gray-950 sm:text-5xl">
                  {label}
                </span>
                <ArrowUpRight
                  size={24}
                  className="self-center text-gray-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-950 group-hover:opacity-100"
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom actions */}
        <div
          style={{ transitionDelay: isOpen ? "420ms" : "0ms" }}
          className={`mx-auto w-full max-w-7xl px-8 pb-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-12 ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="border-t border-gray-950/8 pt-6">
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-4 text-sm font-semibold text-white"
            >
              Create invoice
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="mt-4 block text-center text-sm font-medium text-gray-500 transition hover:text-blue-600"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};