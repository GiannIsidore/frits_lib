// frontend/context/AuthContext.tsx

"use client";

import { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

interface User {
  UserID: number;
  Name: string;
  Email: string;
  UserType: string;
  ContactInfo: string; // Added ContactInfo property
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    try {
      const response = await axiosInstance.get("/User.php?action=checkAuth");
      if (response.data.status === "authenticated") {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
