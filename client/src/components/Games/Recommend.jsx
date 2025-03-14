import { useState, useEffect } from "react";

const Recommend = () => {
  const [booksByGenre, setBooksByGenre] = useState({});
  const [recommendedBook, setRecommendedBook] = useState("📖 Please select a genre");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("https://deploycapstone.onrender.com/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");

        const data = await response.json();
        console.log("📚 Fetched books:", data);

        if (!Array.isArray(data) || data.length === 0) {
          setError("⚠️ No books found in the database.");
          setLoading(false);
          return;
        }

        const booksByGenreMap = {};
        data.forEach((book) => {
          if (book.bookGenre && book.bookTitle) {
            if (!booksByGenreMap[book.bookGenre]) {
              booksByGenreMap[book.bookGenre] = [];
            }
            booksByGenreMap[book.bookGenre].push(book.bookTitle);
          }
        });

        if (Object.keys(booksByGenreMap).length === 0) {
          setError("⚠️ No genres available. Check your database.");
        } else {
          setBooksByGenre(booksByGenreMap);
        }
      } catch (err) {
        console.error("❌ Error fetching books:", err);
        setError("❌ Error fetching books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const recommendBook = (genre) => {
    if (!booksByGenre[genre] || booksByGenre[genre].length === 0) {
      setRecommendedBook("⚠️ No books found for this genre.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * booksByGenre[genre].length);
    setRecommendedBook(`📖 Recommended Book: ${booksByGenre[genre][randomIndex]}`);
  };

  const styles = {
    container: {
      textAlign: "center",
      backgroundColor: "#FAE5D3",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      maxWidth: "550px",
      margin: "50px auto",
      fontFamily: "'Poppins', sans-serif",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#5F3418",
    },
    subtitle: {
      fontSize: "16px",
      color: "#6D4C41",
      marginBottom: "20px",
    },
    genreButtons: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      marginBottom: "20px",
    },
    button: {
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: "bold",
      borderRadius: "6px",
      backgroundColor: "#8B5E34",
      color: "#FFFFFF",
      cursor: "pointer",
      border: "none",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#A87C4E",
      transform: "scale(1.05)",
    },
    recommendationBox: {
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#FCE8D5",
      borderRadius: "8px",
      fontSize: "18px",
      fontWeight: "bold",
      color: "#5F3418",
      border: "2px solid #E2C2A0",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    errorMessage: {
      color: "#D9534F",
      fontSize: "16px",
      fontWeight: "bold",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📚 Book Recommendation</h1>
      <p style={styles.subtitle}>Select a genre to get a random book recommendation:</p>

      {loading ? (
        <p>⏳ Loading books...</p>
      ) : error ? (
        <p style={styles.errorMessage}>{error}</p>
      ) : Object.keys(booksByGenre).length === 0 ? (
        <p style={styles.errorMessage}>⚠️ No genres available.</p>
      ) : (
        <div style={styles.genreButtons}>
          {Object.keys(booksByGenre).map((genre) => (
            <button
              key={genre}
              style={styles.button}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
              onClick={() => recommendBook(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      <div style={styles.recommendationBox}>{recommendedBook}</div>
    </div>
  );
};

export default Recommend;
