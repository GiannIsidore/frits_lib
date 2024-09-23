// frontend/app/page.tsx

"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to the Library Management System
      </h1>
      <div className="space-x-4">
        <Link href="/login">
          <p className="text-blue-600 hover:underline">Login</p>
        </Link>
        <Link href="/register">
          <p className="text-blue-600 hover:underline">Register</p>
        </Link>
      </div>
    </div>
  );
}
