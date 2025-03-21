import React, { useEffect, useState } from "react";
import axios from "axios";
import BorrowBookButton from "./borrowButton";
import "../css/bookdisplay.css";

const BookDisplay = ({ searchQuery, bookAdded }) => {
  const [books, setBooks] = useState([]);
  const [ratingUpdated, setRatingUpdated] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortOption, setSortOption] = useState("bookid"); // Set default to 'bookid'
  const BASE_URL = "https://deploycapstone.onrender.com";

  // Fetch Books
  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/books`);
      console.log("📥 Books API Response:", response.data);

      const updatedBooks = response.data.map((book) => ({
        ...book,
        averageRating: book.averageRating
          ? book.averageRating.toFixed(1)
          : "No ratings yet",
      }));

      setBooks(updatedBooks);
    } catch (error) {
      console.error("❌ Failed to fetch books:", error);
    }
  };

  // Fetch books on mount and when a book is added
  useEffect(() => {
    fetchBooks();
  }, [ratingUpdated, bookAdded]); // 🔄 Refresh when rating changes or a book is added

  // Refresh books when rating is updated
  const handleRatingUpdate = () => setRatingUpdated((prev) => !prev);

  // Load current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) setCurrentUser(user);
  }, []);

  // Open & Close Modal
  const openModal = (book) => setSelectedBook(book);
  const closeModal = () => setSelectedBook(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Convert newline characters into <br /> tags
  const formatDescription = (description) =>
    description
      ? description.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))
      : "";

  // Sort books based on selected option
  const sortBooks = (books) => {
    return [...books].sort((a, b) => {
      const getValue = (book, key) => (book[key] || "").toLowerCase().trim();
      switch (sortOption) {
        case "title":
          return getValue(a, "bookTitle").localeCompare(getValue(b, "bookTitle"));
        case "author":
          return getValue(a, "bookAuthor").localeCompare(getValue(b, "bookAuthor"));
        case "genre":
          return getValue(a, "bookGenre").localeCompare(getValue(b, "bookGenre"));
        case "academic":
          return a.bookCategory === "academic" ? -1 : 1;
        case "non-academic":
          return a.bookCategory === "non-academic" ? -1 : 1;
        case "bookid":
          return a.bookID.localeCompare(b.bookID); // Sort by bookID
        default:
          return 0; // Default to no sorting
      }
    });
  };

  // Filter and sort books based on search query
  const filteredAndSortedBooks = sortBooks(
    books.filter((book) =>
      book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Open the PDF in a new tab
  const viewPdf = (pdfUrl) => {
    const finalUrl = pdfUrl.startsWith("http") ? pdfUrl : `${BASE_URL}${pdfUrl}`;
    window.open(finalUrl, "_blank");
  };

  return (
    <div className="book-display-container">
      <h1>Books</h1>

      {/* Sorting Dropdown */}
      <div className="sort-container">
        <label htmlFor="sort">Sort By: </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="bookid">Default</option>
          <option value="title">Alphabetical (Title)</option>
          <option value="author">Author</option>
          <option value="genre">Genre</option>
          <option value="academic">academic</option>
          <option value="non-academic">non-academic</option>
        </select>
      </div>

      {filteredAndSortedBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul className="book-list">
          {filteredAndSortedBooks.map((book) => (
            <li key={book._id} className="book-card" onClick={() => openModal(book)}>
              <img src={`${BASE_URL}${book.bookCoverUrl}`} alt="Book Cover" />
              <h2>{book.bookTitle}</h2>
              <p><strong>Author:</strong> {book.bookAuthor}</p>
              <p><strong>Genre:</strong> {book.bookGenre}</p>
              <p><strong>Platform:</strong> {book.bookPlatform}</p>
              <p><strong>Category:</strong> {book.bookCategory || "Not specified"}</p>
              <p className={`availability ${book.bookAvailability ? "available" : "unavailable"}`}>
                {book.bookAvailability ? "Available" : "Not Available"}
              </p>
              <p><strong>Average Rating:</strong> {book.averageRating} ⭐</p>
              <p><strong>Copies Available:</strong> {book.copiesAvailable}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <img src={`${BASE_URL}${selectedBook.bookCoverUrl}`} alt="Book Cover" />
            <h2>{selectedBook.bookTitle}</h2>
            <p><strong>Author:</strong> {selectedBook.bookAuthor}</p>
            <p><strong>Genre:</strong> {selectedBook.bookGenre}</p>
            <p><strong>Platform:</strong> {selectedBook.bookPlatform}</p>
            <p><strong>Category:</strong> {selectedBook.bookCategory || "Not specified"}</p>
            <p><strong>Description:</strong></p>
            <div className="book-description">
              {formatDescription(selectedBook.bookDescription)}
            </div>
            <p><strong>Average Rating:</strong> {selectedBook.averageRating} ⭐</p>
            <p className={`availability ${selectedBook.bookAvailability ? "available" : "unavailable"}`}>
              {selectedBook.bookAvailability ? "Available" : "Not Available"}
            </p>
            <p><strong>Copies Available:</strong> {selectedBook.copiesAvailable}</p>

            {/* PDF Button */}
            {selectedBook.bookPdfUrl?.trim() ? (
              <button
                className="pdf-button"
                onClick={() => viewPdf(selectedBook.bookPdfUrl)}
              >
                View PDF
              </button>
            ) : (
              <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
                No PDF available.
              </p>
            )}

            {/* Borrow Book Button (if logged in) */}
            {currentUser ? (
              <BorrowBookButton bookID={selectedBook._id} userId={currentUser.id} className="borrow-button" />
            ) : (
              <p>Please log in to borrow books.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDisplay;
