import React, { useState, useEffect } from "react";
import "../css/booklist.css";

const BookList = () => {
  // State for the Add Book form
  const [book, setBook] = useState({
    bookID: "",
    bookTitle: "",
    bookAuthor: "",
    bookDescription: "",
    bookGenre: "",
    bookPlatform: "Physical",
    bookAvailability: true, // Boolean value
    bookCategory: "academic", // stored lowercase by default
    bookCover: null,
    bookPdfUrl: "",
  });

  // Fetch books from the backend on mount / refresh
  const fetchBooks = async () => {
    try {
      const response = await fetch("https://deploycapstone.onrender.com/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle input changes (text, select, checkbox)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBook((prevBook) => ({
      ...prevBook,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setBook((prevBook) => ({
      ...prevBook,
      bookCover: e.target.files[0],
    }));
  };

  // Handle form submission to add a new book
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bookID", book.bookID);
    formData.append("bookTitle", book.bookTitle);
    formData.append("bookAuthor", book.bookAuthor);
    formData.append("bookDescription", book.bookDescription);
    formData.append("bookGenre", book.bookGenre);
    formData.append("bookPlatform", book.bookPlatform);
    formData.append("bookAvailability", book.bookAvailability ? "true" : "false");
    formData.append("bookCategory", book.bookCategory);

    if (book.bookCover) {
      formData.append("bookCover", book.bookCover);
    }

    if (book.bookPdfUrl.trim()) {
      formData.append("bookPdfUrl", book.bookPdfUrl.trim());
    }

    console.log("📤 Sending data:", Object.fromEntries(formData));

    try {
      const response = await fetch("https://deploycapstone.onrender.com/api/books", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const newBook = await response.json();
      console.log("✅ Book added successfully:", newBook);

      // Refresh book list after adding
      fetchBooks();

      // Reset form
      setBook({
        bookID: "",
        bookTitle: "",
        bookAuthor: "",
        bookDescription: "",
        bookGenre: "",
        bookPlatform: "Physical",
        bookAvailability: true,
        bookCategory: "academic",
        bookCover: null,
        bookPdfUrl: "",
      });
    } catch (error) {
      console.error("❌ Failed to add book:", error);
    }
  };

  return (
    <div className="booklist-container">
      <h2>Add a New Book</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="add-book-form">
        <input
          type="text"
          name="bookID"
          value={book.bookID}
          onChange={handleChange}
          placeholder="Book ID"
          required
        />
        <input
          type="text"
          name="bookTitle"
          value={book.bookTitle}
          onChange={handleChange}
          placeholder="Book Title"
          required
        />
        <input
          type="text"
          name="bookAuthor"
          value={book.bookAuthor}
          onChange={handleChange}
          placeholder="Author"
          required
        />

        <textarea
          name="bookDescription"
          value={book.bookDescription}
          onChange={handleChange}
          placeholder="Description"
          required
          rows="6"
          cols="50"
        />

        <input
          type="text"
          name="bookGenre"
          value={book.bookGenre}
          onChange={handleChange}
          placeholder="Genre"
          required
        />

        <label>Upload Book Cover:</label>
        <input
          type="file"
          name="bookCover"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        <label htmlFor="bookCategory">Book Category:</label>
        <select
          name="bookCategory"
          value={book.bookCategory}
          onChange={handleChange}
          required
        >
          <option value="academic">academic</option>
          <option value="non-academic">non-academic</option>
        </select>

        <select
          name="bookPlatform"
          value={book.bookPlatform}
          onChange={handleChange}
          required
        >
          <option value="Physical">Physical</option>
          <option value="Digital">Digital</option>
        </select>

        <div className="checkbox-container">
          <label>
            Available:
            <input
              type="checkbox"
              name="bookAvailability"
              checked={book.bookAvailability}
              onChange={handleChange}
            />
          </label>
        </div>

        <input
          type="text"
          name="bookPdfUrl"
          value={book.bookPdfUrl}
          onChange={handleChange}
          placeholder="PDF Link (optional)"
        />

        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default BookList;
