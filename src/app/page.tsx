"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { token } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-100 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-center">📈 AI Stock Mentor</h1>
      <p className="text-base sm:text-lg text-gray-400 max-w-xl text-center mb-10 px-4">
        Your personal AI-powered stock market assistant. Get insights, compare
        stocks, assess risks, and test your knowledge with interactive tools.
      </p>

      <Link
        href="/overview" // Direct access to dashboard without auth
        className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-semibold shadow-xl transition text-base sm:text-lg w-full sm:w-auto text-center max-w-xs"
      >
        Go to Dashboard →
      </Link>
    </div>
  );
}
