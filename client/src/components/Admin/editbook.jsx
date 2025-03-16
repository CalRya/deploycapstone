import React, { useState, useEffect } from "react";

const EditBook = ({ bookToEdit, onClose, onBookUpdated }) => {
  if (!bookToEdit) {
    console.warn("⚠ bookToEdit is missing! EditBook component will not render.");
    return null;
  }

  const [bookData, setBookData] = useState({
    bookTitle: "",
    bookAuthor: "",
    bookDescription: "",
    bookGenre: "",
    bookPlatform: "",
    bookAvailability: false,
    bookCoverUrl: "",
    bookPdfUrl: "",
    bookCategory: "non-academic", // Default category
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    setBookData({
      bookTitle: bookToEdit.bookTitle || "",
      bookAuthor: bookToEdit.bookAuthor || "",
      bookDescription: bookToEdit.bookDescription || "",
      bookGenre: bookToEdit.bookGenre || "",
      bookPlatform: bookToEdit.bookPlatform || "",
      bookAvailability: bookToEdit.bookAvailability ?? false,
      bookCoverUrl: bookToEdit.bookCoverUrl || "",
      bookPdfUrl: bookToEdit.bookPdfUrl || "",
      bookCategory: bookToEdit.bookCategory || "non-academic",
    });

    if (bookToEdit.bookCoverUrl?.trim()) {
      setPreviewImage(
        bookToEdit.bookCoverUrl.startsWith("http")
          ? bookToEdit.bookCoverUrl
          : `https://deploycapstone.onrender.com${bookToEdit.bookCoverUrl}`
      );
    }
  }, [bookToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookToEdit._id) {
      console.error("❌ bookToEdit._id is missing! Cannot update book.");
      return;
    }

    console.log("📤 Submitting form with data:", bookData);

    const formData = new FormData();
    formData.append("bookTitle", bookData.bookTitle);
    formData.append("bookAuthor", bookData.bookAuthor);
    formData.append("bookDescription", bookData.bookDescription);
    formData.append("bookGenre", bookData.bookGenre);
    formData.append("bookPlatform", bookData.bookPlatform);
    formData.append("bookAvailability", bookData.bookAvailability ? "true" : "false");
    formData.append("bookCategory", bookData.bookCategory);

    if (selectedFile) {
      formData.append("bookCover", selectedFile);
    } else if (bookData.bookCoverUrl) {
      // This field will simply pass along the current URL if no file is selected
      formData.append("bookCoverUrl", bookData.bookCoverUrl);
    }

    if (bookData.bookPdfUrl?.trim()) {
      formData.append("bookPdfUrl", bookData.bookPdfUrl.trim());
    }

    try {
      const response = await fetch(
        `https://deploycapstone.onrender.com/api/books/${bookToEdit._id}`,
        {
          method: "PUT",
          // Remove the Content-Type header so the browser can set it appropriately for FormData.
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update book");
      }

      const updatedBook = await response.json();
      console.log("✅ Book updated:", updatedBook);
      onBookUpdated(updatedBook);
      window.location.reload();
      onClose();
    } catch (error) {
      console.error("❌ Error updating book:", error);
    }
  };

  return (
    <div style={styles.editBookForm}>
      <h2 style={styles.heading}>✏ Edit Book</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {previewImage && (
          <div style={styles.imagePreviewContainer}>
            <img src={previewImage} alt="Book Cover" style={styles.previewImage} />
          </div>
        )}

        <label style={styles.label}>Change Cover:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />

        <label style={styles.label}>Title:</label>
        <input
          type="text"
          name="bookTitle"
          value={bookData.bookTitle}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label style={styles.label}>Author:</label>
        <input
          type="text"
          name="bookAuthor"
          value={bookData.bookAuthor}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label style={styles.label}>Description:</label>
        <textarea
          name="bookDescription"
          value={bookData.bookDescription}
          onChange={handleChange}
          style={styles.textarea}
        />

        <label style={styles.label}>Genre:</label>
        <input
          type="text"
          name="bookGenre"
          value={bookData.bookGenre}
          onChange={handleChange}
          style={styles.input}
        />

        <label style={styles.label}>Platform:</label>
        <input
          type="text"
          name="bookPlatform"
          value={bookData.bookPlatform}
          onChange={handleChange}
          style={styles.input}
        />

        <label style={styles.label}>
          Available:
          <input
            type="checkbox"
            name="bookAvailability"
            checked={bookData.bookAvailability}
            onChange={handleChange}
            style={styles.checkbox}
          />
        </label>

        <label style={styles.label}>PDF Link:</label>
        <input
          type="text"
          name="bookPdfUrl"
          value={bookData.bookPdfUrl}
          onChange={handleChange}
          placeholder="https://example.com/book.pdf"
          style={styles.input}
        />

        {/* Dropdown for Academic/Non-Academic */}
        <label style={styles.label}>Category:</label>
        <select
          name="bookCategory"
          value={bookData.bookCategory}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="academic">academic</option>
          <option value="non-academic">non-academic</option>
        </select>

        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.saveButton}>
            Save Changes
          </button>
          <button type="button" onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  editBookForm: {
    background: "linear-gradient(145deg, #fff8f3, #f2e1d5)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "8px 8px 20px rgba(0, 0, 0, 0.12)",
    maxWidth: "550px",
    margin: "30px auto",
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#5c3d2e",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#7a6652",
    textAlign: "left",
    marginBottom: "5px",
  },
  input: {
    padding: "12px",
    border: "1px solid #c8a383",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #c8a383",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    height: "100px",
  },
  select: {
    padding: "12px",
    border: "1px solid #c8a383",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    cursor: "pointer",
  },
  fileInput: {
    marginBottom: "10px",
  },
  checkbox: {
    marginLeft: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#5c3d2e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#ccc",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default EditBook;
