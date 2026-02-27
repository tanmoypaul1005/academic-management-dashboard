import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academic Management Dashboard",
  description: "Manage students, courses, and faculty members",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-slate-900`}
      >
        <Navigation />
        <main className="lg:ml-72 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
