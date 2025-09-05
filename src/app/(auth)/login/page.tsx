"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.userId);
        toast.success("Login successful!");
        setTimeout(() => router.push("/portfolio"), 1500);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 sm:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password with toggle */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 py-2 sm:py-3 rounded-lg font-semibold text-base sm:text-lg mb-4"
        >
          Login
        </button>

        <div className="text-center">
          <p className="text-gray-400 mb-2">Don't have an account?</p>
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Sign up here
          </Link>
        </div>
      </form>
    </div>
  );
}
