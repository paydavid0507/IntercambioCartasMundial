import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
