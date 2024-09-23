// components/SearchComponent.tsx
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/navigation";

interface Book {
  BookID: number;
  Title: string;
  Author: string;
  Genre: string;
  AvailableCopies: number;
}

interface SearchComponentProps {
  onResults?: (results: Book[]) => void;
  placeholder?: string;
  showResults?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onResults,
  placeholder = "Enter book title, author, or ISBN",
  showResults = true,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.get(
        `/backend/api/Book.php?action=search&query=${encodeURIComponent(query)}`
      );
      setResults(response.data.books);

      // If a callback is provided, pass the results to the parent component
      if (onResults) {
        onResults(response.data.books);
      }
    } catch (error) {
      console.error("Error searching books:", error);
    }
  };

  return (
    <div className="search-component">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {showResults && results.length > 0 && (
        <div className="search-results">
          <ul>
            {results.map((book) => (
              <li key={book.BookID} className="search-result-item">
                <strong>{book.Title}</strong> by {book.Author}
                <button
                  onClick={() => router.push(`/books/${book.BookID}`)}
                  className="view-details-button"
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
