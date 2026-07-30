import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationTracker from "@/components/NavigationTracker";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StreamVibe — The Best Streaming Experience",
    template: "%s | StreamVibe",
  },
  description:
    "StreamVibe is the best streaming experience for watching your favorite movies and shows on demand, anytime, anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} h-full overflow-x-hidden antialiased`}
      style={{ overflowX: "hidden", maxWidth: "100%" }}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full min-h-dvh w-full max-w-full flex-col overflow-x-hidden bg-background font-sans text-foreground"
        style={{ overflowX: "hidden", maxWidth: "100%" }}
        suppressHydrationWarning
      >
        <Header />
        <Suspense fallback={null}>
          <NavigationTracker />
        </Suspense>
        <main
          className="w-full min-w-0 max-w-full flex-1 overflow-x-hidden"
          style={{ overflowX: "hidden", maxWidth: "100%" }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
