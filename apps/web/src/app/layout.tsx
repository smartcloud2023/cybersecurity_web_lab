import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberLab — Practical Cybersecurity Labs",
  description:
    "Launch isolated, procedurally mutated penetration testing labs, get AI-mentored hints, and earn a verifiable skills credential.",
};

// Applies the stored dashboard accent before first paint, so switching
// pages/reloading never flashes the default color first. Runs only in the
// browser (blocking inline script); safe no-op during server render.
const NO_FLASH_ACCENT_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem("cyberlab-accent");
    if (stored) document.documentElement.setAttribute("data-accent", stored);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_ACCENT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
