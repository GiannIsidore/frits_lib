// frontend/app/books/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axiosInstance from "../../../utils/axiosInstance";

interface Book {
  BookID: number;
  Title: string;
  Author: string;
  ISBN: string;
  PublicationDate: string;
  Genre: string;
  Location: string;
  TotalCopies: number;
  AvailableCopies: number;
}

export default function BookDetailsPage() {
  const [book, setBook] = useState<Book | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const fetchBookDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/Book.php?action=get&bookID=${id}`
      );
      if (response.data.status === "success") {
        setBook(response.data.book);
      } else {
        alert(response.data.message);
        router.push("/books");
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded">
      <h1 className="text-3xl font-bold mb-4">{book.Title}</h1>
      <p>
        <strong>Author:</strong> {book.Author}
      </p>
      <p>
        <strong>ISBN:</strong> {book.ISBN}
      </p>
      <p>
        <strong>Publication Date:</strong> {book.PublicationDate}
      </p>
      <p>
        <strong>Genre:</strong> {book.Genre}
      </p>
      <p>
        <strong>Location:</strong> {book.Location}
      </p>
      <p>
        <strong>Total Copies:</strong> {book.TotalCopies}
      </p>
      <p>
        <strong>Available Copies:</strong> {book.AvailableCopies}
      </p>
      {/* Additional actions like borrow, reserve, etc. */}
    </div>
  );
}
