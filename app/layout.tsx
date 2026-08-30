import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
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
  title: "base-app",
  description:
    "Base Next.js 16 + Clerk + Zustand + Drizzle/SQLite + shadcn/ui + Tailwind",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Clerk Core 3: ClerkProvider va DENTRO de <body>, no envolviendo <html>. */}
        <ClerkProvider>
          <header className="flex items-center justify-between border-b px-6 py-3">
            <span className="font-semibold">base-app</span>
            <nav className="flex items-center gap-3">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
