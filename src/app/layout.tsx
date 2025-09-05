// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AI Stock Mentor",
  description: "Dark themed AI stock assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className="bg-gray-950 text-gray-100 font-sans h-full overflow-hidden">
        <AuthProvider>
          <div className="h-full flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
              <Navbar />
            </div>
            <main className="flex-1 pt-20 overflow-hidden">
              {children}
            </main>
          </div>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
