// frontend/app/books/page.tsx

"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import BookCard from "../../components/BookCard"; // Adjust the path as necessary

interface Book {
  BookID: number;
  Title: string;
  Author: string;
  Genre: string;
  AvailableCopies: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get("/Book.php?action=getAll");
      if (response.data.status === "success") {
        setBooks(response.data.books);
      } else {
        setError(response.data.message || "Failed to fetch books.");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Book List</h1>
      {books.length === 0 ? (
        <p className="text-center text-gray-600">No books available.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.BookID} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
