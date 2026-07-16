import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Research Studio",
  description: "Ask questions across 18 curated RAG research papers. Grounded answers with verified citations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
