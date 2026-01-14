import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from '@vercel/analytics/react';
import { Lexend } from 'next/font/google';
import "./globals.css";
import { Providers } from "./providers";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/seo";

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "OnlyDogFood.com - Dog Food Ratings & Comparisons",
    template: "%s | OnlyDogFood.com",
  },
  description: "Compare 200+ dog food brands. Science-based ratings, nutritional analysis, and price comparisons to find the best food for your dog.",
  keywords: ["dog food", "dog food reviews", "best dog food", "dog food comparison", "pet nutrition"],
  authors: [{ name: "OnlyDogFood.com" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://onlydogfood.com",
    siteName: "OnlyDogFood.com",
    title: "OnlyDogFood.com - Dog Food Ratings & Comparisons",
    description: "Compare 200+ dog food brands. Science-based ratings, nutritional analysis, and price comparisons.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnlyDogFood.com - Dog Food Ratings & Comparisons",
    description: "Compare 200+ dog food brands. Science-based ratings and nutritional analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="antialiased">
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </Providers>

        {/* Site-wide Structured Data */}
        <OrganizationStructuredData />
        <WebSiteStructuredData />

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
