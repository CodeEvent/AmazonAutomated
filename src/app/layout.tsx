import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { auth } from "@/lib/auth";

// Airbnb Cereal VF is a licensed, non-distributable font. Inter is the
// closest open-source substitute (see docs/design.md "Note on Font
// Substitutes"), loaded as the --font-sans value used across the theme.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wayfarer — Find your next stay",
  description: "Search and book hotels, apartments, and homes worldwide.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wayfarer",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Next's appleWebApp.capable only emits the modern mobile-web-app-capable
            tag; older iOS versions still key standalone mode off this legacy one. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <MotionConfig reducedMotion="user">
          <SiteChrome user={session?.user ?? null} isAuthenticated={Boolean(session?.user)}>
            {children}
          </SiteChrome>
        </MotionConfig>
      </body>
    </html>
  );
}
