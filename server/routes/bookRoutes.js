const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const authenticateUser = require("../middleware/authMiddleware");

// Configure multer for file uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const uploadConfig = multer({ storage: storageConfig });

// 📌 Get Active Borrow Count (STRICT)
router.get("/count/:userId", authenticateUser, async (req, res) => {
  console.log("📌 Received request for active borrow count");
  console.log("🆔 User ID:", req.params.userId);
  try {
    const { userId } = req.params;
    if (userId !== req.user.id) {
      console.log("❌ Unauthorized access attempt");
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const activeBorrows = await Borrow.countDocuments({
      user: userId,
      status: { $in: ["pending", "approved", "overdue"] },
    });
    console.log("📊 Active Borrows Count:", activeBorrows);
    res.json({ activeBorrows });
  } catch (error) {
    console.error("❌ Error fetching active borrow count:", error);
    res.status(500).json({ message: "Error fetching active borrow count" });
  }
});

// ✅ Get All Books (with optional sorting by category)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.bookCategory = category.toLowerCase(); // Ensure case-insensitive matching
    }
    
    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// ✅ Add New Book (POST)
router.post("/", uploadConfig.single("bookCover"), async (req, res) => {
  try {
    console.log("📥 Received book data:", req.body);
    console.log("File data:", req.file);
    const {
      bookID,
      bookTitle,
      bookAuthor,
      bookDescription,
      bookGenre,
      bookPlatform,
      bookAvailability,
      bookPdfUrl,
      bookCategory, // ✅ NEW FIELD
    } = req.body;

    const bookCoverUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const isAvailable = bookAvailability === "true";

    console.log("📌 Processed bookAvailability:", isAvailable);

    const newBook = new Book({
      bookID,
      bookTitle,
      bookAuthor,
      bookDescription: bookDescription || "",
      bookGenre: bookGenre || "",
      bookPlatform: bookPlatform || "",
      bookAvailability: isAvailable,
      bookCoverUrl,
      bookPdfUrl: bookPdfUrl ? bookPdfUrl.trim() : "",
      averageRating: 0,
      bookCategory: bookCategory || "Non-Academic", // Default to "Non-Academic" if not provided
    });

    console.log("✅ Final book object before saving:", newBook);
    await newBook.save();

    res.status(201).json({ message: "✅ Book added successfully!", book: newBook });
  } catch (error) {
    console.error("❌ Error adding book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update Book (PUT)
router.put("/:id", uploadConfig.single("bookCover"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 Received update for book:", id, req.body, req.file);
    const {
      bookTitle,
      bookAuthor,
      bookDescription,
      bookGenre,
      bookPlatform,
      bookAvailability,
      bookPdfUrl,
      bookCategory, // ✅ NEW FIELD
    } = req.body;

    const bookCoverUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.bookCoverUrl || "";
    const isAvailable = bookAvailability === "true";

    const updatedFields = {
      bookTitle: bookTitle || "",
      bookAuthor: bookAuthor || "",
      bookDescription: bookDescription || "",
      bookGenre: bookGenre || "",
      bookPlatform: bookPlatform || "",
      bookAvailability: isAvailable,
      bookCoverUrl,
      bookPdfUrl: bookPdfUrl ? bookPdfUrl.trim() : "",
      bookCategory: bookCategory ? bookCategory.toLowerCase() : "",
    };

    const updatedBook = await Book.findByIdAndUpdate(id, updatedFields, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    console.log("✅ Book updated:", updatedBook);
    res.status(200).json({ message: "✅ Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("❌ Error updating book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
