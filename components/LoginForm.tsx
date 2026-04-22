"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="alex@gmail.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Sign In
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don’t have an account?{" "}
          <span className="text-gray-900 font-medium cursor-pointer hover:underline">
            Register
          </span>
        </p>
      </form>
    </div>
  );
}