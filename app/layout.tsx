import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invora",
  description: "Invoices made simple.",
  icons: {
    icon: "/icon.png",
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={dmSans.variable}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
