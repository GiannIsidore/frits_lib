// transactions/page.tsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Transaction {
  TransactionID: number;
  BookID: number;
  Title: string;
  BorrowDate: string;
  DueDate: string;
  ReturnDate: string | null;
  LateFees: string | null;
}

const TransactionsPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchTransactions();
    }
  }, [user, router]);

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get(
        `/backend/api/Transaction.php?action=getByUser&userId=${user.UserID}`
      );
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleReturn = async (transactionId: number) => {
    try {
      await axiosInstance.post("/backend/api/Transaction.php?action=return", {
        transactionId,
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error returning book:", error);
    }
  };

  return (
    <div className="transactions-container">
      <h2>Your Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Late Fees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.TransactionID}>
              <td>{txn.Title}</td>
              <td>{txn.BorrowDate}</td>
              <td>{txn.DueDate}</td>
              <td>{txn.ReturnDate || "Not Returned"}</td>
              <td>{txn.LateFees || "N/A"}</td>
              <td>
                {!txn.ReturnDate && (
                  <button onClick={() => handleReturn(txn.TransactionID)}>
                    Return Book
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

export default TransactionsPage;
