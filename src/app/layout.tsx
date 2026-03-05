import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';

import { prisma } from "../lib/prisma";
import CookieBanner from "@/components/CookieBanner";
import WcagWidget from "@/components/WcagWidget";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSetting.findFirst();

  const ogTitle = settings?.ogTitle || settings?.title || "Elektryk Bez Spięcia";
  const ogDescription = settings?.ogDescription || settings?.description || "Profesjonalne usługi elektryczne i pomiary";
  const ogImage = settings?.ogImageUrl || settings?.logoUrl;

  return {
    title: settings?.title || "Elektryk Bez Spięcia",
    description: settings?.description || "Profesjonalne usługi elektryczne i pomiary",
    keywords: settings?.keywords || "elektryk, instalacje elektryczne, pomiary",
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      locale: "pl_PL",
      type: "website",
      siteName: ogTitle,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    },
    icons: {
      icon: settings?.iconUrl || "/favicon.ico",
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.siteSetting.findFirst();

  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        {settings?.googleAnalyticsId && (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
          />
        )}
        {settings?.googleAnalyticsId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAnalyticsId}');
              `,
            }}
          />
        )}
        {settings?.metaPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.metaPixelId}');
              fbq('track', 'PageView');
              `,
            }}
          />
        )}
        {settings?.metaPixelId && (
          <noscript>
            <img height="1" width="1" style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${settings.metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        {settings?.trackingScript && (
          <div dangerouslySetInnerHTML={{ __html: settings.trackingScript }} />
        )}
        {/* Schema.org LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ElectricalContractor",
              name: settings?.title || "Elektryk Bez Spięcia",
              description: settings?.description || "",
              telephone: settings?.contactPhone || "",
              email: settings?.contactMail || "",
              address: {
                "@type": "PostalAddress",
                streetAddress: settings?.address || "",
                addressCountry: "PL",
              },
              url: process.env.NEXT_PUBLIC_BASE_URL || "https://elektrykbezspiecia.pl",
              openingHours: settings?.workingHours ? settings.workingHours.split("\n").map((h: string) => h.trim()).filter(Boolean) : [],
              image: settings?.logoUrl || "",
              sameAs: [settings?.facebookUrl, settings?.instagramUrl].filter(Boolean),
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" />
        {children}
        <WcagWidget />
        <WhatsAppWidget phone={settings?.contactPhone || ""} />
        <CookieBanner />
      </body>
    </html>
  );
}
