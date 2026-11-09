import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { site } from "@/content/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} scroll-smooth antialiased`}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
