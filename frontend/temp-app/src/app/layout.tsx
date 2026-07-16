import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { EmergencyProvider } from "@/hooks/use-emergency";
import { AuthProvider } from "@/hooks/use-auth";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Healthcare AI OS",
  description: "A calm, intelligent AI physician that listens before it speaks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <EmergencyProvider>{children}</EmergencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
