"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        toast.success("User registered successfully!");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        const { error } = await res.json();
        toast.error(error || "Signup failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950 px-4">
      <form
        onSubmit={handleSignup}
        className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-2 sm:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full mb-4 p-2 sm:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password with toggle */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
          className="w-full bg-blue-500 hover:bg-blue-600 py-2 sm:py-3 rounded-lg font-semibold text-base sm:text-lg"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
