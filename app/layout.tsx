import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intercambia Mundial 2026",
  description:
    "Administra tus cartas faltantes y repetidas del álbum Panini Mundial 2026 y encuentra usuarios para intercambiar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
