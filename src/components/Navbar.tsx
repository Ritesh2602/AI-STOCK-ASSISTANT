"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-lg sm:text-xl font-bold text-blue-400">
          📈 AI Stock Mentor
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {token ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-medium"
            >
              Logout
            </button>
          ) : (
            <div className="flex space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4">
          {token ? (
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-medium"
            >
              Logout
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium text-center"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}