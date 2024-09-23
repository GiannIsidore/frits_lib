// frontend/app/providers/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axiosInstance from "../../../utils/axiosInstance";

interface Provider {
  ProviderID: number;
  Name: string;
  ContactInfo: string;
  Email: string;
}

export default function ProviderDetailsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const fetchProviderDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/BookProvider.php?action=get&providerID=${id}`
      );
      if (response.data.status === "success") {
        setProvider(response.data.provider);
      } else {
        alert(response.data.message);
        router.push("/providers");
      }
    } catch (error) {
      console.error("Error fetching provider details:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProviderDetails();
    }
  }, [id]);

  if (!provider) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded">
      <h1 className="text-3xl font-bold mb-4">{provider.Name}</h1>
      <p>
        <strong>Contact Information:</strong> {provider.ContactInfo}
      </p>
      <p>
        <strong>Email:</strong> {provider.Email}
      </p>
      {/* Additional actions like editing provider details if admin */}
    </div>
  );
}
