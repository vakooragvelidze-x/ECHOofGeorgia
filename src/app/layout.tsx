import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECHO Georgia — Voices of Georgian History",
  description:
    "AI-powered interpretations of Georgian historical figures, built from biographies, writings, historical sources, and cultural memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  );
}