import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/layout/Chatbot";
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
  title: "Alros Investments S.L. - Venta y Alquiler en Benalmádena",
  description: "Alros Investments S.L. - Desde 1992 asesorando en la gestión inmobiliaria. Venta y alquiler de apartamentos, casas y locales con la máxima transparencia.",
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
      </body>
    </html>
  );
}
