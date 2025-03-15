import React, { useState, useEffect } from "react";

const SpinWheel = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // Fetch random books from the database
  const fetchRandomBooks = async () => {
    try {
      const response = await fetch("https://deploycapstone.onrender.com/api/books/random?limit=5");
      if (!response.ok) throw new Error("Failed to fetch books");

      let data = await response.json();
      if (!data || data.length === 0) throw new Error("No books received");

      data = data.slice(0, 5);

      // Prepare each slice with color + info
      const formattedBooks = data.map((book, i) => ({
        bookTitle: book.bookTitle || `Book ${i + 1}`,
        bookCover: book.bookCoverUrl
          ? `https://deploycapstone.onrender.com${book.bookCoverUrl}`
          : null,
        color: getWheelColor(i),
      }));

      setBooks(formattedBooks);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    }
  };

  // Simple color palette for slices
  const getWheelColor = (index) => {
    const colors = ["#C19A6B", "#8B5E3C", "#D2B48C", "#A67B5B", "#7D4E2D"];
    return colors[index % colors.length];
  };

  // Build a conic-gradient for slices
  const buildConicGradient = (slices) => {
    if (!slices || slices.length === 0) return "white";

    const sliceAngle = 360 / slices.length;
    const parts = slices.map((slice, i) => {
      const start = i * sliceAngle;
      const end = (i + 1) * sliceAngle;
      return `${slice.color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${parts.join(", ")})`;
  };

  const startGame = async () => {
    if (!gameStarted) {
      setGameStarted(true);
      setAngle(0);
      setSpinning(false);
      setSelectedBook(null);
      await fetchRandomBooks();
    }
  };

  const exitGame = () => {
    setGameStarted(false);
    setSelectedBook(null);
  };

  const spinAgain = async () => {
    setSelectedBook(null);
    await fetchRandomBooks();
  };

  // Spin logic
  const spinWheel = () => {
    if (spinning || books.length === 0) return;
    setSpinning(true);

    // Random angle between 2 and 5 full rotations (720° - 1800°)
    const extraSpins = Math.floor(Math.random() * 1080) + 720;
    const newAngle = angle + extraSpins;
    setAngle(newAngle);

    // Determine winning slice after 3s transition
    setTimeout(() => {
      const sliceAngle = 360 / books.length;
      const normalizedAngle = newAngle % 360;
      const winningIndex = Math.floor(normalizedAngle / sliceAngle);

      setSelectedBook(books[winningIndex]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div style={styles.container}>
      {/* Start Screen */}
      {!gameStarted ? (
        <div style={styles.startScreen}>
          <h2 style={styles.title}>📚 Spin the Wheel & Get a Book Recommendation!</h2>
          <button style={styles.button} onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Show Wheel or Selected Book */}
          {!selectedBook ? (
            <>
              <h1 style={styles.title}>📖 Spin the Wheel!</h1>
              {books.length > 0 ? (
                <div style={styles.wheelArea}>
                  {/* Arrow (pointing down) */}
                  <div style={styles.arrow} />

                  {/* Wheel with rotating covers */}
                  <div
                    style={{
                      ...styles.wheel,
                      transform: `rotate(${angle}deg)`,
                      background: buildConicGradient(books),
                    }}
                  >
                    {books.map((book, i) => {
                      const sliceAngle = 360 / books.length;
                      const labelAngle = (i + 0.5) * sliceAngle;
                      return (
                        <div
                          key={i}
                          style={{
                            ...styles.sliceLabel,
                            // Move images out so they appear near the edge
                            transform: `translate(-50%, -50%) rotate(${labelAngle}deg) translate(110px)`,
                          }}
                        >
                          {book.bookCover ? (
                            <img
                              src={book.bookCover}
                              alt={book.bookTitle}
                              style={styles.sliceCover}
                            />
                          ) : (
                            <span style={styles.sliceText}>{book.bookTitle}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Buttons (side by side) */}
                  <div style={styles.buttonRow}>
                    <button style={styles.spinButton} onClick={spinWheel} disabled={spinning}>
                      {spinning ? "Spinning..." : "Spin"}
                    </button>
                    <button style={styles.exitButton} onClick={exitGame}>
                      Exit Game
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: "red", fontSize: "18px" }}>
                  ❌ No books available. Check your database.
                </p>
              )}
            </>
          ) : (
            // Show the chosen book
            <div style={styles.resultContainer}>
              <h2 style={styles.resultText}>📚 Your Recommendation:</h2>
              {selectedBook.bookCover ? (
                <img src={selectedBook.bookCover} alt="Book Cover" style={styles.bookCover} />
              ) : (
                <p style={{ fontSize: "18px", color: "gray" }}>No cover available</p>
              )}
              <h3 style={styles.resultTitle}>{selectedBook.bookTitle}</h3>

              <div style={styles.buttonRow}>
                <button style={styles.spinAgainButton} onClick={spinAgain}>
                  🔄 Spin Again
                </button>
                <button style={styles.exitButton} onClick={exitGame}>
                  Exit Game
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* 🎨 Styles */
const styles = {
  container: {
    backgroundColor: "#F5E1C8",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "600px", // container size
    margin: "40px auto",
    textAlign: "center",
    fontFamily: "Century Gothic, sans-serif",
    color: "#5a3e2b",
  },
  startScreen: {
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  button: {
    border: "none",
    padding: "12px 18px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    fontWeight: "bold",
    color: "white",
    background: "linear-gradient(145deg, #D2B48C, #8B5E3C)",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  wheelArea: {
    position: "relative",
    margin: "20px auto",
    width: "300px",
    height: "300px",
  },
  wheel: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "5px solid #222",
    transition: "transform 3s ease-out",
    overflow: "hidden",
  },
  arrow: {
    position: "absolute",
    top: "-35px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    // pointing down
    borderLeft: "15px solid transparent",
    borderRight: "15px solid transparent",
    borderBottom: "35px solid #FF0000",
  },
  sliceLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    pointerEvents: "none",
  },
  // ⚠ Adjust for a more portrait aspect ratio
  sliceCover: {
    width: "50px",  // narrower width
    height: "80px", // taller height => more portrait
    objectFit: "cover",
    borderRadius: "4px",
    border: "2px solid #fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
  },
  sliceText: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "4px 6px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    whiteSpace: "nowrap",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
  },
  spinButton: {
    border: "none",
    padding: "10px 14px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "20px",
    fontWeight: "bold",
    color: "white",
    background: "#D2B48C",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  exitButton: {
    border: "none",
    padding: "10px 14px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "20px",
    fontWeight: "bold",
    color: "white",
    background: "#8B5E3C",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  resultContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  resultText: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  bookCover: {
    width: "180px",
    height: "250px",
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    marginTop: "10px",
  },
  resultTitle: {
    fontSize: "18px",
    marginTop: "10px",
  },
  spinAgainButton: {
    border: "none",
    padding: "10px 14px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    fontWeight: "bold",
    color: "white",
    background: "#5A3E2B",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
};

export default SpinWheel;
