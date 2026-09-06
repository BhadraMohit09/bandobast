import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/features/auth/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "bandobast | Outage Intelligence",
  description: "Community-powered outage reporting for local power and water disruptions across India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#10201B] font-sans selection:bg-[#10201B] selection:text-[#F5F4EF]">
        <SmoothScrollProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </AuthProvider>

        
        <footer className="mt-auto border-t border-[#D8D8D1] bg-[#F5F4EF] py-12 px-6 md:px-12">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-serif text-2xl font-medium tracking-tight mb-2">bandobast</h2>
            <p className="text-[#5E6B68] font-serif italic text-lg mb-8 max-w-md">
              Community-powered outage intelligence for local communities.
            </p>
            
            <div className="flex flex-wrap items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">
              <Link href="/areas" className="hover:text-[#10201B] transition-colors">Areas Index</Link>
              <Link href="/report" className="hover:text-[#10201B] transition-colors">Report Outage</Link>
              <Link href="/about" className="hover:text-[#10201B] transition-colors">About bandobast</Link>
              <Link href="/guidelines" className="hover:text-[#10201B] transition-colors">Guidelines</Link>
              <span className="ml-auto">© {new Date().getFullYear()} bandobast</span>
            </div>
          </div>
        </footer>
        </SmoothScrollProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
