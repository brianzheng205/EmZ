"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import crypto from "crypto";

import "../globals.css";

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hashedPassword =
      "db3c867ca74f7d91b1a265ffa949e62e3095aede758916b34e49975457ee0987";

    if (hashValue(password) === hashedPassword) {
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
