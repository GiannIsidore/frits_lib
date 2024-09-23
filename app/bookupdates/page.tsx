// frontend/app/bookupdates/page.tsx

"use client";

import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "next/router";

interface BookUpdate {
  UpdateID: number;
  BookID: number;
  Title: string;
  RequestDate: string;
  Status: string;
  Description: string;
}

const BookUpdatesPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [bookUpdates, setBookUpdates] = useState<BookUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.UserType !== "Librarian") {
      router.push("/login");
    } else {
      fetchBookUpdates();
    }
  }, [user, router]);

  const fetchBookUpdates = async () => {
    try {
      const response = await axiosInstance.get("/BookUpdate.php?action=getAll");
      if (response.data.status === "success") {
        setBookUpdates(response.data.bookUpdates);
      } else {
        setError(response.data.message || "Failed to fetch book updates.");
      }
    } catch (error) {
      console.error("Error fetching book updates:", error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (updateId: number, status: string) => {
    try {
      await axiosInstance.post("/BookUpdate.php?action=updateStatus", {
        updateId,
        status,
      });
      // Optionally, you can show a success message here
      fetchBookUpdates();
    } catch (error) {
      console.error("Error updating status:", error);
      // Optionally, handle error feedback to the user
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <p className="text-xl">Loading book updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-primary">Book Updates</h2>
      {bookUpdates.length === 0 ? (
        <p className="text-center text-muted">No book updates available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card text-foreground">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-secondary text-left text-sm font-medium uppercase tracking-wider">
                  Book Title
                </th>
                <th className="px-6 py-3 border-b border-secondary text-left text-sm font-medium uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 border-b border-secondary text-left text-sm font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b border-secondary text-left text-sm font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 border-b border-secondary text-left text-sm font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookUpdates.map((update) => (
                <tr key={update.UpdateID} className="hover:bg-secondary/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {update.Title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(update.RequestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        update.Status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : update.Status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : update.Status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {update.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {update.Description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      title="select"
                      value={update.Status}
                      onChange={(e) =>
                        updateStatus(update.UpdateID, e.target.value)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookUpdatesPage;
