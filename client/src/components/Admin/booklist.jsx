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
    bookCategory: "academic", // NEW field for Academic/Non-Academic (stored lowercase)
    bookCover: null,
    bookPdfUrl: "", // NEW field for PDF link
  });

  // State for filter and list of books
  const [books, setBooks] = useState([]);
  // Selected category filter: "" (all), "academic", or "non-academic"
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch books from the backend when the component mounts and after adding a new book
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

  // Filter the books based on the selected category
  const filteredBooks = books.filter((b) => {
    if (!selectedCategory) return true;
    return b.bookCategory === selectedCategory;
  });

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
    formData.append("bookAvailability", book.bookAvailability ? "true" : "false"); // Convert to string for backend
    formData.append("bookCategory", book.bookCategory); // Add category field

    if (book.bookCover) {
      formData.append("bookCover", book.bookCover);
    }

    // Append PDF link if provided
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
        bookCategory: "academic", // Reset category
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
        ></textarea>

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

        {/* Select Academic or Non-Academic */}
        <label htmlFor="bookCategory">Book Category:</label>
        <select
          name="bookCategory"
          value={book.bookCategory}
          onChange={handleChange}
          required
        >
          <option value="academic">Academic</option>
          <option value="non-academic">Non-Academic</option>
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

        {/* PDF Link Input */}
        <input
          type="text"
          name="bookPdfUrl"
          value={book.bookPdfUrl}
          onChange={handleChange}
          placeholder="PDF Link (optional)"
        />

        <button type="submit">Add Book</button>
      </form>

      <hr />

      <h2>Book List</h2>
      {/* Dropdown to filter by category */}
      <div className="filter-container">
        <label htmlFor="filterCategory">Filter by Category:</label>
        <select
          id="filterCategory"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          <option value="academic">Academic</option>
          <option value="non-academic">Non-Academic</option>
        </select>
      </div>

      {/* Render filtered books */}
      <div className="books-container">
        {filteredBooks.map((b) => (
          <div key={b._id} className="book-card">
            <img
              src={
                b.bookCoverUrl && b.bookCoverUrl.startsWith("http")
                  ? b.bookCoverUrl
                  : `https://deploycapstone.onrender.com${b.bookCoverUrl}`
              }
              alt="Book Cover"
              className="book-cover"
            />
            <h3>{b.bookTitle}</h3>
            <p>Author: {b.bookAuthor}</p>
            <p>Category: {b.bookCategory}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;
