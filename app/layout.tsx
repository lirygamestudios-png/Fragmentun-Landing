import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FRAGMENTUN I — El Despertar Emocional",
  description: "Sitio oficial de FRAGMENTUN, universo de ciencia ficción emocional de José Liranzo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
