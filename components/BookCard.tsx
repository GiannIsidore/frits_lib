// components/BookCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card"; // Adjust import based on your setup
import { Button } from "@/components/ui/button"; // Adjust import based on your setup

interface Book {
  BookID: number;
  Title: string;
  Author: string;
  Genre: string;
  AvailableCopies: number;
}

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-2xl font-bold mb-2">{book.Title}</h2>
      <p className="text-gray-700">Author: {book.Author}</p>
      <p className="text-gray-700">Genre: {book.Genre}</p>
      <p className="text-gray-700">Available Copies: {book.AvailableCopies}</p>
      <Link href={`/books/${book.BookID}`} passHref>
        <Button className="mt-4">View Details</Button>
      </Link>
    </Card>
  );
};

export default BookCard;
