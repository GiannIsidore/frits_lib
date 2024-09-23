// profile/page.tsx

"use client";

import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();

  const [name, setName] = useState(user?.Name || "");
  const [contactInfo, setContactInfo] = useState(user?.ContactInfo || "");
  const [email, setEmail] = useState(user?.Email || "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        "/User.php?action=updateProfile",
        {
          name,
          contactInfo,
          email,
          password,
        }
      );

      // Update the user in the AuthContext
      setUser({ ...user, Name: name, ContactInfo: contactInfo, Email: email });
      alert(response.data.message || "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.message || "Failed to update profile.");
      } else {
        alert("Failed to update profile.");
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <label>Name:</label>
        <input
          title="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Contact Info:</label>
        <input
          title="contactInfo"
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
        <label>Email:</label>
        <input
          title="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>New Password (leave blank to keep current):</label>
        <input
          title="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
