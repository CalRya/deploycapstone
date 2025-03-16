    const mongoose = require("mongoose"); // Import mongoose

    const bookSchema = new mongoose.Schema({
        bookID: { type: String, unique: true }, // Optional if using MongoDB's default _id
        bookTitle: { type: String, required: true },
        bookAuthor: { type: String, required: true },
        bookDescription: { type: String },
        bookGenre: { type: String },
        bookPlatform: { type: String },
        bookAvailability: { type: Boolean, default: true }, // Default is AVAILABLE
        bookCoverUrl: { type: String },
        bookPdfUrl: { type: String },
        ratings: [{ user: mongoose.Schema.Types.ObjectId, rating: Number }], // ⭐ New Ratings Array
        averageRating: { type: Number, default: 0 },
        copiesAvailable: { type: Number, default: 1 },
        bookCategory: { type: String, enum: ["academic", "non-academic"], required: true},
    });

    const Book = mongoose.model("Book", bookSchema); // Create model

    module.exports = Book; // Export the model
