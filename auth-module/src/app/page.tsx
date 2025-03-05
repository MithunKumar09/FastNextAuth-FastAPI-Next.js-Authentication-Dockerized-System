//src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our Platform</h1>
      <p className="text-lg mb-6">Get started by navigating to the registration page.</p>
      <button
        onClick={() => router.push("/auth/register")}
        className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-all"
      >
        Next Page
      </button>
    </div>
  );
}
