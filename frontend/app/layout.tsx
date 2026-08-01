import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Luh Gerald Eco System",
  description: "AI-powered business command center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-space-950 font-display antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
