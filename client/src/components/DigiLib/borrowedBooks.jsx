import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../css/borrowedBook.css";

const BASE_URL = "https://deploycapstone.onrender.com/api";

const BorrowedBooks = ({ id: propId, onRatingUpdate }) => {
  const { id: paramId } = useParams();
  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const localStorageId = storedUser?.id || storedUser?._id;
  const id = propId || paramId || localStorageId;

  console.log("🟢 User ID in BorrowedBooks:", id);

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      if (!id) {
        console.warn("❌ No user ID provided. Skipping API call.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/borrow/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBorrowedBooks(response.data || []);
        console.log("✅ Borrowed Books Response:", response.data);
      } catch (error) {
        console.error("❌ Error fetching borrowed books:", error);
        setError("Failed to load borrowed books. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, [id]);

  const handleRating = async (borrowId, rating) => {
    if (!borrowId || rating < 1 || rating > 5) {
      alert("❌ Invalid rating. Please select a number between 1 and 5.");
      return;
    }

    try {
      console.log(`📤 Submitting rating: ${rating} for borrow ID: ${borrowId}`);

      const response = await axios.put(
        `${BASE_URL}/rate/${borrowId}`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Rating submitted successfully:", response.data);

      setBorrowedBooks((prevBooks) =>
        prevBooks.map((borrow) =>
          borrow._id === borrowId ? { ...borrow, rating } : borrow
        )
      );

      if (onRatingUpdate) {
        console.log("🔔 Triggering onRatingUpdate...");
        onRatingUpdate();
      }

      alert(response.data.message || "Rating submitted successfully!");
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
      alert(error.response?.data?.message || "Error.");
    }
  };

  return (
    <div className="borrowed-books-container">
      <h2 className="borrowed-books-title">Borrowed Books</h2>
      {loading ? (
        <p>Loading borrowed books...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : borrowedBooks.length > 0 ? (
        <ul className="borrowed-books-list">
          {borrowedBooks.map((borrow) => {
            if (!borrow.book) return null;

            const today = new Date();
            const dueDate = borrow.dueDate ? new Date(borrow.dueDate) : null;
            const returnDate = borrow.returnDate ? new Date(borrow.returnDate) : null;
            let statusText = borrow.status;
            let statusClass = "";

            if (borrow.status === "approved" && dueDate && today > dueDate) {
              statusText = "Overdue";
              statusClass = "status-overdue";
            } else {
              const statusMap = {
                pending: "status-pending",
                approved: "status-borrowed",
                returned: "status-returned",
                overdue: "status-overdue",
                denied: "status-denied",
              };
              statusClass = statusMap[borrow.status] || "status-unknown";
            }

            return (
              <li key={borrow._id} className="borrowed-book-item">
                {borrow.book?.bookCoverUrl && (
                  <img
                    src={`${BASE_URL}${borrow.book.bookCoverUrl}`}
                    alt={borrow.book?.bookTitle || "Book Cover"}
                    className="book-image"
                  />
                )}
                <div className="book-details">
                  <h3 className="book-title">{borrow.book?.bookTitle || "Unknown Title"}</h3>
                  <p className="book-info">
                    <strong>Author:</strong> {borrow.book?.bookAuthor || "Unknown Author"}
                  </p>
                  <p className="borrowed-date">
                    <strong>Borrowed:</strong> {borrow.borrowDate ? new Date(borrow.borrowDate).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="borrowed-date">
                    <strong>Due:</strong> {dueDate ? dueDate.toLocaleDateString() : "N/A"}
                  </p>
                  {returnDate && (
                    <p className="borrowed-date">
                      <strong>Returned:</strong> {returnDate.toLocaleDateString()}
                    </p>
                  )}
                  <p className={`status ${statusClass}`}>{statusText}</p>

                  {borrow.status === "returned" ? (
                    borrow.rating ? (
                      <p className="rating-display">
                        <strong>Already Rated:</strong> {"★".repeat(borrow.rating)}
                      </p>
                    ) : (
                      <div className="rating-container">
                        <p><strong>Rate this book:</strong></p>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="star"
                            onClick={() => handleRating(borrow._id, star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="no-books">No borrowed books found.</p>
      )}
    </div>
  );
};

export default BorrowedBooks;
