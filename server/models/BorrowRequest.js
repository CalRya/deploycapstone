const mongoose = require("mongoose");

const BorrowRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    status: { type: String, default: "pending" }, // "pending", "approved", "denied"
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BorrowRequest", BorrowRequestSchema);
