import "../globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Stock Mentor",
  description: "Your AI-powered stock assistant",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar - Compressed on small screens */}
      <aside className="w-12 md:w-16 lg:w-64 bg-gray-900 border-r border-gray-800 p-1 md:p-2 lg:p-4">
        <h1 className="text-xl font-bold text-white mb-6 hidden lg:block">
          📊 AI Stock Mentor
        </h1>
        <div className="text-lg md:text-2xl mb-4 md:mb-6 text-center lg:hidden">
          📊
        </div>
        <nav className="space-y-1 md:space-y-2">
          <Link
            href="/overview"
            className="block px-1 md:px-2 lg:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-800 text-center lg:text-left text-xs md:text-base"
            title="Overview"
          >
            <span className="lg:hidden">📈</span>
            <span className="hidden lg:inline">Overview</span>
          </Link>
          <Link
            href="/compare"
            className="block px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-800 text-center lg:text-left"
            title="Compare"
          >
            <span className="lg:hidden">⚖️</span>
            <span className="hidden lg:inline">Compare</span>
          </Link>
          <Link
            href="/explain"
            className="block px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-800 text-center lg:text-left"
            title="Explain"
          >
            <span className="lg:hidden">💡</span>
            <span className="hidden lg:inline">Explain</span>
          </Link>
          <Link
            href="/risk"
            className="block px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-800 text-center lg:text-left"
            title="Risk"
          >
            <span className="lg:hidden">⚠️</span>
            <span className="hidden lg:inline">Risk</span>
          </Link>
          <Link
            href="/portfolio"
            className="block px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-800 text-center lg:text-left"
            title="Portfolio"
          >
            <span className="lg:hidden">💼</span>
            <span className="hidden lg:inline">Portfolio</span>
          </Link>
          <Link
            href="/sectors"
            className="block px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-800 text-center lg:text-left"
            title="Sectors"
          >
            <span className="lg:hidden">🏭</span>
            <span className="hidden lg:inline">Sectors</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
