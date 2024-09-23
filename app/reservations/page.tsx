// reservations/page.tsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Reservation {
  ReservationID: number;
  BookID: number;
  Title: string;
  ReservationDate: string;
  ExpirationDate: string;
  Status: string;
}

const ReservationsPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchReservations();
    }
  }, [user, router]);

  const fetchReservations = async () => {
    try {
      const response = await axiosInstance.get(
        `/backend/api/Reservation.php?action=getByUser&userId=${user.UserID}`
      );
      setReservations(response.data.reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const handleCancel = async (reservationId: number) => {
    try {
      await axiosInstance.post("/backend/api/Reservation.php?action=cancel", {
        reservationId,
      });
      fetchReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
    }
  };

  return (
    <div className="reservations-container">
      <h2>Your Reservations</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Reservation Date</th>
            <th>Expiration Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.ReservationID}>
              <td>{res.Title}</td>
              <td>{res.ReservationDate}</td>
              <td>{res.ExpirationDate}</td>
              <td>{res.Status}</td>
              <td>
                {res.Status === "Active" && (
                  <button onClick={() => handleCancel(res.ReservationID)}>
                    Cancel Reservation
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationsPage;
