import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import { Providers } from "./providers";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/seo";

// Import Geist fonts
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";

import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/600.css";
import "@fontsource/geist-mono/700.css";

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
    <html lang="en">
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
