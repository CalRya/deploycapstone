import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/LibraryPreview.css";

const LibraryPreview = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`https://deploycapstone.onrender.com/api/books`);
        setBooks(response.data.slice(0, 5)); // Limit to 5 books
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="library-preview">
      <h2>Explore Our Library</h2>
      <div className="book-preview-container">
        <div className="book-preview-list">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              <img
                src={book.bookCoverUrl?.startsWith("http") ? book.bookCoverUrl : `https://deploycapstone.onrender.com${book.bookCoverUrl}`}
                alt="Book Cover"
                className="book-cover"
              />
              <p className="book-title">{book.bookTitle || "Unknown Title"}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="more-books-container">
        <Link to="/lib" className="more-books-btn">More Books</Link>
      </div>
    </div>
  );
};

export default LibraryPreview;
