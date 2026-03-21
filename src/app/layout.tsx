import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/layout/Chatbot";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { ScrollRestorer } from "@/components/layout/ScrollRestorer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alros Investments S.L. | Inmobiliaria en Benalmádena y Costa del Sol",
    template: "%s | Alros Investments"
  },
  description: "Especialistas en la gestión inmobiliaria en Benalmádena desde 1992. Venta y alquiler de apartamentos, casas y locales con transparencia y trato personalizado.",
  keywords: ["inmobiliaria Benalmádena", "alquiler Benalmádena", "venta propiedades Costa del Sol", "Alros Investments", "pisos en Benalmádena"],
  authors: [{ name: "Alros Investments S.L." }],
  creator: "Alros Investments",
  publisher: "Alros Investments S.L.",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.alros.eu",
    siteName: "Alros Investments S.L.",
    title: "Alros Investments S.L. | Inmobiliaria en Benalmádena",
    description: "Expertos en gestión inmobiliaria desde 1992. Encuentra tu hogar ideal en Benalmádena y la Costa del Sol.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Alros Investments S.L.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alros Investments S.L. | Inmobiliaria en Benalmádena",
    description: "Expertos en gestión inmobiliaria desde 1992 en la Costa del Sol.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ScrollRestorer />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Chatbot />
        <CookieBanner />
        
        {/* Anti-copy script for images & selection protection as requested */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('contextmenu', function(e) {
            if (e.target.nodeName === 'IMG') {
              e.preventDefault();
            }
          }, false);
          document.addEventListener('dragstart', function(e) {
            if (e.target.nodeName === 'IMG') {
              e.preventDefault();
            }
          }, false);
        `}} />
      </body>
    </html>
  );
}
