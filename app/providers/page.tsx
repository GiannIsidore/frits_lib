// frontend/app/providers/page.tsx

"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Link from "next/link";

interface Provider {
  ProviderID: number;
  Name: string;
  ContactInfo: string;
  Email: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);

  const fetchProviders = async () => {
    try {
      const response = await axiosInstance.get(
        "/BookProvider.php?action=getAll"
      );
      if (response.data.status === "success") {
        setProviders(response.data.providers);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Book Providers</h1>
      <ul className="space-y-4">
        {providers.map((provider) => (
          <li key={provider.ProviderID} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{provider.Name}</h2>
            <p>Contact Info: {provider.ContactInfo}</p>
            <p>Email: {provider.Email}</p>
            <Link href={`/providers/${provider.ProviderID}`}>
              <a className="text-blue-600 hover:underline">View Details</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
