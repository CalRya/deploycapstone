import { useState, useEffect } from "react";

const Recommend = () => {
  const [booksByGenre, setBooksByGenre] = useState({});
  const [recommendedBook, setRecommendedBook] = useState("Please select a genre");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("https://deploycapstone.onrender.com/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");

        const data = await response.json();
        console.log("Fetched books:", data);

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No books found in the database.");
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
          setError("❌ No genres available. Check your database.");
        } else {
          setBooksByGenre(booksByGenreMap);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const recommendBook = (genre) => {
    const books = booksByGenre[genre] || [];

    if (books.length === 0) {
      setRecommendedBook("⚠️ No books found for this genre.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * books.length);
    setRecommendedBook(`📖 Recommended Book: ${books[randomIndex]}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📚 <span>Book Recommendation</span></h1>
      <p style={styles.subtitle}>Select a genre to get a random book recommendation:</p>

      {loading ? (
        <p>Loading books...</p>
      ) : error ? (
        <p style={styles.errorMessage}>{error}</p>
      ) : (
        <div style={styles.genreButtons}>
          {Object.keys(booksByGenre).map((genre) => (
            <button
              key={genre}
              style={styles.button}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                e.target.style.transform = styles.buttonHover.transform;
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = styles.button.backgroundColor;
                e.target.style.transform = "scale(1)";
              }}
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

const styles = {
  container: {
    textAlign: "center",
    backgroundColor: "#FAE5D3",
    padding: "30px",
    border: "2px solid #5F3418",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "50px auto",
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#5F3418",
  },
  subtitle: {
    fontSize: "16px",
    marginBottom: "15px",
  },
  genreButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "6px",
    backgroundColor: "#8B5E34",
    color: "#FFFFFF",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
  },
  buttonHover: {
    backgroundColor: "#A87C4E",
    transform: "scale(1.05)",
  },
  recommendationBox: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#FAE5D3",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#5F3418",
    border: "2px solid #E2C2A1",
  },
  errorMessage: {
    color: "#D9534F",
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
};

export default Recommend;
 