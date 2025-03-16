const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userModel = require("../models/User");
const bookRoutes = require("../routes/bookRoutes");
const adminRoutes = require("../routes/adminRoutes");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const articleRoutes = require("../routes/articleRoutes");
const borrowRoutes = require("../routes/borrowRoutes");
const authenticateUser = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const Quote = require("../models/Quotes"); // Use the existing model instead of redefining it
const premiumRoutes = require("../routes/premiumRoutes");
const MONGODB_URI = "mongodb+srv://lindsaysal07:P%40ssw0rd0119@library1.v2ang.mongodb.net/CAPSTONE?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    await Book.updateMany({}, { $set: { averageRating: 0 } });
    console.log("✅ Initialized averageRating for all books");
})
.catch((err) => console.error("❌ MongoDB connection error:", err));

const calculateLateFee = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysLate = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
    if (daysLate === 0) return 0;
    return 15 + (daysLate - 1) * 5;
};

app.use(express.json());
const allowedOrigins = [
    "http://localhost:5173",
    "https://pageturnerdeploy.vercel.app",
    /\.vercel\.app$/,
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith(".vercel.app"))) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

app.options("*", (req, res) => {
    console.log("Pre-flight request received");
    res.sendStatus(200);
});

// --- New Route to support frontend calls to /borrow/:user ---
app.get("/borrow/:user", async (req, res) => {
    try {
        const { user } = req.params;
        if (!user) return res.status(400).json({ message: "User ID is required" });
        const borrowedBooks = await Borrow.find({ user: user, status: { $in: ["pending", "approved", "returned"] } })
            .populate("book");
        res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error("❌ Error fetching borrowed books:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Existing routes:
app.get("/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { user, email, password } = req.body;
        if (!user || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({ user, email, password: hashedPassword });
        res.status(201).json({
            message: "User registered successfully",
            id: newUser._id,
            email: newUser.email,
            role: newUser.role
        });
    } catch (err) {
        console.error("❌ Error inserting user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await userModel.findOne({ email });
        if (!foundUser) {
            return res.status(401).json({ error: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({
            message: "✅ Login successful",
            id: foundUser._id,
            email: foundUser.email,
            role: foundUser.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/borrow/:user", async (req, res) => {
    try {
        const { user } = req.params;
        if (!user) return res.status(400).json({ message: "User ID is required" });
        const borrowedBooks = await Borrow.find({ user: user, status: { $in: ["pending", "approved", "returned"] } })
            .populate("book");
        res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error("❌ Error fetching borrowed books:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// NEW ROUTE for fetching all users (for admin dashboard)
app.get("/api/users", async (req, res) => {
    try {
        const users = await userModel.find().select("user email role premium");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route for fetching a single user by ID:
app.get("/api/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("🔍 Searching for user with ID:", userId);
        const user = await userModel.findById(userId).select("user email role premium");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});  

app.post("/api/borrow/:bookID", async (req, res) => {
    try {
        const { bookID } = req.params;
        const { user } = req.body;
        if (!bookID || !user) {
            return res.status(400).json({ message: "Missing book ID or user ID" });
        }
        const existingBorrow = await Borrow.findOne({ book: bookID, status: { $in: ["pending", "approved"] } });
        if (existingBorrow) {
            return res.status(400).json({ message: "Book is already borrowed or awaiting approval" });
        }
        const borrowEntry = new Borrow({
            user: user,
            book: bookID,
            status: "pending",
            borrowDate: new Date(),
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });
        console.log("📌 New Borrow Request:", borrowEntry);
        await borrowEntry.save();
        await Book.findByIdAndUpdate(bookID, { bookAvailability: false, borrowedBy: user });
        res.status(201).json({ message: "Borrow request sent!", borrow: borrowEntry });
    } catch (error) {
        console.error("❌ Error in borrowing book:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/api/borrow/approve/:borrowId", async (req, res) => {
    try {
        const { borrowId } = req.params;
        const borrowEntry = await Borrow.findById(borrowId);
        if (!borrowEntry) {
            return res.status(404).json({ message: "Borrow request not found" });
        }
        if (borrowEntry.status !== "pending") {
            return res.status(400).json({ message: "Request is already processed" });
        }
        borrowEntry.status = "approved";
        await borrowEntry.save();
        res.status(200).json({ message: "Request approved successfully!", borrow: borrowEntry });
    } catch (error) {
        console.error("❌ Error approving borrow request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/api/borrow/return/:borrowId", async (req, res) => {
    try {
        const { borrowId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(borrowId)) {
            return res.status(400).json({ message: "Invalid borrow ID format" });
        }
        const borrowEntry = await Borrow.findById(borrowId);
        if (!borrowEntry) {
            return res.status(404).json({ message: "Borrow record not found" });
        }
        const lateFee = calculateLateFee(borrowEntry.dueDate);
        borrowEntry.status = "returned";
        borrowEntry.returnedAt = new Date();
        borrowEntry.lateFee = lateFee;
        await borrowEntry.save();
        await Book.findByIdAndUpdate(borrowEntry.book, { bookAvailability: true, borrowedBy: null });
        res.status(200).json({ message: "Book returned successfully!", returnDate: new Date(), lateFee });
    } catch (error) {
        console.error("❌ Error returning book:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.get("/api/books/random", async (req, res) => {
    try {
        const books = await Book.aggregate([{ $sample: { size: 8 } }]);
        res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.get("/api/borrow", async (req, res) => {
    try {
        const borrowRequests = await Borrow.find({
            status: { $in: ["pending", "approved", "returned", "overdue"] }
        })
        .populate("book")
        .populate("user");
        console.log("📜 Borrow Requests Found:", JSON.stringify(borrowRequests, null, 2));
        res.json(borrowRequests);
    } catch (error) {
        console.error("❌ Error fetching borrow requests:", error);
        res.status(500).json({ error: "Failed to fetch borrow requests" });
    }
});

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadConfig = multer({ storage: storageConfig });

// POST route to add a new book
app.post("/api/books", uploadConfig.single("bookCover"), async (req, res) => {
    try {
      console.log("📥 Received book data:", req.body);
      console.log("File data:", req.file);
      
      // Destructure bookCategory along with other fields from the request body
      const {
        bookID,
        bookTitle,
        bookAuthor,
        bookDescription,
        bookGenre,
        bookPlatform,
        bookAvailability,
        bookPdfUrl, // Store PDF link if provided
        bookCategory, // NEW: Grab bookCategory from req.body
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
        bookCategory: bookCategory || "non-academic", // Use provided category or default to "non-academic"
      });
  
      console.log("✅ Final book object before saving:", newBook);
      await newBook.save();
  
      res.status(201).json({ message: "✅ Book added successfully!", book: newBook });
    } catch (error) {
      console.error("❌ Error adding book:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});

// NEW PUT endpoint for updating a book
app.put("/api/books/:id", uploadConfig.single("bookCover"), async (req, res) => {
  try {
    const { id } = req.params;
    // Copy all fields from the body into updateData
    const updateData = { ...req.body };

    // If a file was uploaded, update the bookCoverUrl field
    if (req.file) {
      updateData.bookCoverUrl = `/uploads/${req.file.filename}`;
    }
    // Convert bookAvailability from string to boolean if present
    if (typeof updateData.bookAvailability !== "undefined") {
      updateData.bookAvailability = updateData.bookAvailability === "true";
    }
    // Trim the PDF URL if provided
    if (updateData.bookPdfUrl) {
      updateData.bookPdfUrl = updateData.bookPdfUrl.trim();
    }
    
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json({ message: "Book updated successfully", book: updatedBook });
  } catch (err) {
    console.error("❌ Error updating book:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!["admin", "librarian", "student", "courier"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Role updated successfully", user });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/stats", async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const totalBooks = await Book.countDocuments();
        const totalBorrowedBooks = await Borrow.countDocuments({ isReturned: false });
        const activeSessions = 20;
        res.json({
            totalUsers,
            totalBooks,
            totalBorrowedBooks,
            activeSessions,
        });
    } catch (error) {
        console.error("❌ Error fetching stats:", error);
        res.status(500).send("Error fetching stats");
    }
});

app.put("/api/rate/:borrowId", async (req, res) => {
    console.log("🚀 API HIT: PUT /api/rate/:borrowId");
    try {
        const { rating } = req.body;
        let borrowId = req.params.borrowId.trim();
        console.log("📩 Received Rating Request for Borrow ID:", borrowId, "Rating:", rating);
        if (!rating || rating < 1 || rating > 5) {
            console.log("❌ Invalid rating received");
            return res.status(400).json({ message: "Invalid rating. Must be between 1 and 5." });
        }
        const borrow = await Borrow.findById(borrowId);
        if (!borrow) {
            console.log("❌ Borrow record not found");
            return res.status(404).json({ message: "Borrow record not found" });
        }
        console.log("✅ Found Borrow Record:", borrow);
        const book = await Book.findById(borrow.book);
        if (!book) {
            console.log("❌ Book record not found");
            return res.status(404).json({ message: "Book record not found" });
        }
        console.log("✅ Found Book Record:", book);
        const userRating = book.ratings.find((r) => r.user.toString() === borrow.user.toString());
        if (userRating) {
            console.log("❌ User has already rated this book");
            return res.status(400).json({ message: "You have already rated this book." });
        }
        book.ratings.push({ user: borrow.user, rating });
        await book.save();
        console.log("✅ Rating saved in Book collection");
        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, r) => sum + r.rating, 0);
        const newAverage = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0;
        console.log("⭐ New Average Rating Calculated:", newAverage);
        book.averageRating = newAverage;
        await book.save();
        console.log("✅ Book updated successfully with new average rating:", book);
        res.status(200).json({ message: "Rating submitted successfully!", averageRating: newAverage });
    } catch (error) {
        console.error("❌ Error submitting rating:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.put('/quote/:id', async (req, res) => {
    try {
        const { text, author } = req.body;
        const { id } = req.params;
        const updatedQuote = await Quote.findByIdAndUpdate(
            id,
            { text, author },
            { new: true, runValidators: true }
        );
        if (!updatedQuote) {
            return res.status(404).json({ error: "Quote not found." });
        }
        res.json({ message: "✅ Quote updated successfully!", quote: updatedQuote });
    } catch (error) {
        console.error("❌ Error updating quote:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/quote', async (req, res) => {
    try {
        const quote = await Quote.aggregate([{ $sample: { size: 1 } }]);
        if (!quote.length) {
            return res.status(404).json({ error: "No quotes found." });
        }
        res.json(quote[0]);
    } catch (error) {
        console.error("Error fetching quote:", error);
        res.status(500).json({ error: "Error fetching quote" });
    }
});

app.post("/api/buy-premium", async (req, res) => {
    const { userId } = req.body;
    console.log("🛒 Premium purchase request for:", userId);
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            console.log("❌ User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }
        user.premium = { status: "lifetime", expiryDate: null };
        await user.save();
        console.log("✅ Premium activated successfully for:", userId);
        res.status(200).json({ message: "Premium activated!", premium: user.premium });
    } catch (err) {
        console.error("❌ Error processing premium:", err);
        res.status(500).json({ message: "Error processing premium", error: err.message });
    }
});

app.get("/api/check-premium/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ premium: user.premium });
    } catch (err) {
        res.status(500).json({ message: "Error checking premium status" });
    }
});

app.get("/", (req, res) => {
    res.send("📚 Library Management API is running.");
});

app.use("/api/books", bookRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/premium", premiumRoutes);

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
