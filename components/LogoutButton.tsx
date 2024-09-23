// frontend/components/LogoutButton.tsx

"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

const LogoutButton = () => {
  const { setUser } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/User.php?action=logout");
      if (response.data.status === "success") {
        setUser(null);
        router.push("/login");
      } else {
        console.error("Logout failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
