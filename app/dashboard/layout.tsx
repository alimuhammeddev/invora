"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { firebaseAuth } from "../../lib/firebase";
import { isAccountDeleted } from "../../lib/userAccount";

type DashboardUser = { name: string; email: string };

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function useGreeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const update = () => setGreeting(greetingForHour(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return greeting;
}

/* ---------- Icons ---------- */

function Icon({
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

type IconComponent = ComponentType<{ className?: string }>;

const GridIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
);

const DocumentIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Icon>
);

const SlidersIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
);

const BellIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Z" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icon>
);

const MenuIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Icon>
);

const CloseIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

const ChevronDownIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

const LogoutIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M16 8l4 4-4 4M20 12H9" />
  </Icon>
);

const UserIcon: IconComponent = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Icon>
);

/* ---------- Navigation config ---------- */

const navItems: {
  label: string;
  href: string;
  icon: IconComponent;
  exact?: boolean;
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: GridIcon, exact: true },
  { label: "Invoices", href: "/dashboard/invoices", icon: DocumentIcon },
  { label: "Settings", href: "/dashboard/settings-page", icon: SlidersIcon },
];

function isActive(pathname: string, item: (typeof navItems)[number]) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Avatar({
  size = "h-9 w-9",
  name,
}: {
  size?: string;
  name: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 ring-1 ring-blue-100`}
    >
      {initials(name)}
    </span>
  );
}

/* ---------- Sidebar ---------- */

function SidebarContent({
  user,
  onLogout,
  onClose,
}: {
  user: DashboardUser;
  onLogout: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Image src="/logo.png" alt="Logo" width={80} height={80}/>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Links */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item);
            const ItemIcon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  {/* Brand accent marker for the current page */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-3 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-blue-600 transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <ItemIcon
                    className={`h-5 w-5 transition-colors ${
                      active
                        ? "text-blue-600"
                        : "text-neutral-400 group-hover:text-blue-600"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile, pinned to the bottom */}
      <div className="shrink-0 border-t border-neutral-200 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar size="h-10 w-10" name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-950">
              {user.name}
            </p>
            {user.email && (
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Layout ---------- */

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<DashboardUser>({
    name: "Account",
    email: "",
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const greeting = useGreeting();
  const firstName = user.name === "Account" ? "" : user.name.split(" ")[0];

  useEffect(() => {
    if (!firebaseAuth) return;

    let active = true;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser({ name: "Account", email: "" });
        return;
      }

      void (async () => {
        try {
          if (await isAccountDeleted(firebaseUser.uid)) {
            await signOut(firebaseAuth);
            if (active) router.replace("/login");
            return;
          }
        } catch {
          if (active) router.replace("/login");
          return;
        }

        if (!active) return;
        const email = firebaseUser.email ?? "";
        const emailName = email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "";
        setUser({
          name: firebaseUser.displayName?.trim() || emailName || "Account",
          email,
        });
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  async function onLogout() {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    router.replace("/login");
  }

  // Close menus when the route changes
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Mobile drawer: Escape closes it, and the page behind it does not scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Profile dropdown: close on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-blue-600"
      >
        Skip to content
      </a>

      {/* Desktop sidebar: fixed, never scrolls with the page */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white lg:block">
        <SidebarContent user={user} onLogout={onLogout} />
      </aside>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <aside
          id="mobile-sidebar"
          aria-label="Menu"
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-white shadow-2xl transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "invisible -translate-x-full"
          }`}
        >
          <SidebarContent
            user={user}
            onLogout={onLogout}
            onClose={() => setMobileOpen(false)}
          />
        </aside>
      </div>

      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
          >
            <MenuIcon />
          </button>

          <p className="truncate md:text-lg text-sm font-medium text-neutral-600" aria-live="off">
            {greeting && (
              <>
                {greeting}
                {firstName && <>, <span className="text-blue-600">{firstName}</span></>}
              </>
            )}
          </p>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <BellIcon />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            <span
              aria-hidden="true"
              className="mx-1 hidden h-6 w-px bg-neutral-200 sm:block"
            />

            {/* Profile dropdown */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:pr-3"
              >
                <Avatar name={user.name} />
                <ChevronDownIcon
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-200 motion-reduce:transition-none ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-neutral-950">
                      {user.name}
                    </p>
                    {user.email && (
                      <p className="truncate text-xs text-neutral-500">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <div className="my-1 h-px bg-neutral-100" />
                  <Link
                    href="/dashboard/settings-page"
                    role="menuitem"
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:bg-blue-50"
                  >
                    <UserIcon className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-blue-600" />
                    Account settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:bg-blue-50"
                  >
                    <LogoutIcon className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-blue-600" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content scrolls; the sidebar and header stay put */}
        <main id="main-content" className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};