import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctor AI — Triazhë simptomash",
  description: "Asistent triazhimi i kujdesshëm, njerëzor dhe jo-përsëritës.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
