"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import "../globals.css";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      document.cookie = "accessGranted=true; path=/";
      router.push("/");
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Enter Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded px-4 py-2 mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}