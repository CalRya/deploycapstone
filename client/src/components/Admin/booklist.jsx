import React, { useState } from "react";

const BookList = () => {
  // State for the Add Book form
  const [book, setBook] = useState({
    bookID: "", // ID field now included
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBook({
      ...book,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle file change for book cover
  const handleFileChange = (e) => {
    setBook({
      ...book,
      bookCover: e.target.files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in book) {
        formData.append(key, book[key]);
      }

      const response = await fetch("https://your-api-endpoint.com/api/books", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add book");

      alert("Book added successfully!");
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
      console.error("Error adding book:", error);
    }
  };

  return (
    <div>
      <h2>Add a New Book</h2>
      <form onSubmit={handleSubmit}>
        {/* Book ID (Editable or Auto-Generated) */}
        <label>Book ID:</label>
        <input
          type="text"
          name="bookID"
          value={book.bookID}
          onChange={handleChange}
          disabled={false} // Change to true if the backend auto-generates the ID
        />

        {/* Book Title */}
        <label>Book Title:</label>
        <input
          type="text"
          name="bookTitle"
          value={book.bookTitle}
          onChange={handleChange}
          required
        />

        {/* Author */}
        <label>Author:</label>
        <input
          type="text"
          name="bookAuthor"
          value={book.bookAuthor}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <label>Description:</label>
        <textarea
          name="bookDescription"
          value={book.bookDescription}
          onChange={handleChange}
        />

        {/* Genre */}
        <label>Genre:</label>
        <input
          type="text"
          name="bookGenre"
          value={book.bookGenre}
          onChange={handleChange}
        />

        {/* Upload Book Cover */}
        <label>Upload Book Cover:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {/* Book Category Dropdown */}
        <label>Book Category:</label>
        <select name="bookCategory" value={book.bookCategory} onChange={handleChange}>
          <option value="academic">Academic</option>
          <option value="fiction">Fiction</option>
          <option value="nonfiction">Non-fiction</option>
          <option value="fantasy">Fantasy</option>
        </select>

        {/* Platform Selection */}
        <label>Platform:</label>
        <select name="bookPlatform" value={book.bookPlatform} onChange={handleChange}>
          <option value="Physical">Physical</option>
          <option value="Ebook">Ebook</option>
        </select>

        {/* Availability Checkbox */}
        <label>
          Available:
          <input
            type="checkbox"
            name="bookAvailability"
            checked={book.bookAvailability}
            onChange={handleChange}
          />
        </label>

        {/* Optional PDF Link */}
        <label>PDF Link (optional):</label>
        <input
          type="text"
          name="bookPdfUrl"
          value={book.bookPdfUrl}
          onChange={handleChange}
        />

        {/* Submit Button */}
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default BookList;
