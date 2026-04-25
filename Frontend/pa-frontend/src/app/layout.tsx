import "./globals.css";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Providers } from "./providers";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SecureXAi",
  description: "",
};

const nunito = Nunito({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased`}>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
