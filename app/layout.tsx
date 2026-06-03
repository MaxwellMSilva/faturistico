import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faturístico",
  description: "Sistema de Faturamento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}