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

      // Limit to 5
      data = data.slice(0, 5);

      // Prepare each slice with color + info
      const formattedBooks = data.map((book, i) => ({
        bookTitle: book.bookTitle || `Book ${i + 1}`,
        bookCover: book.bookCoverUrl ? `https://deploycapstone.onrender.com${book.bookCoverUrl}` : null,
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
    let gradientParts = [];

    slices.forEach((slice, i) => {
      const start = i * sliceAngle;
      const end = (i + 1) * sliceAngle;
      gradientParts.push(`${slice.color} ${start}deg ${end}deg`);
    });

    // Combine into a single conic gradient
    return `conic-gradient(${gradientParts.join(", ")})`;
  };

  // Start the game: fetch books + show wheel
  const startGame = async () => {
    if (!gameStarted) {
      setGameStarted(true);
      setAngle(0);
      setSpinning(false);
      setSelectedBook(null);
      await fetchRandomBooks();
    }
  };

  // Exit the game
  const exitGame = () => {
    setGameStarted(false);
    setSelectedBook(null);
  };

  // Spin again (re-fetch or re-spin with same books)
  const spinAgain = async () => {
    setSelectedBook(null);
    await fetchRandomBooks();
  };

  // Handle spinning the wheel
  const spinWheel = () => {
    if (spinning || books.length === 0) return;
    setSpinning(true);

    // Add random angle between 2 and 5 full rotations (720° - 1800°)
    const extraSpins = Math.floor(Math.random() * 1080) + 720;
    const newAngle = angle + extraSpins;
    setAngle(newAngle);

    // Determine winning slice after spin completes (3s = transition time)
    setTimeout(() => {
      const sliceAngle = 360 / books.length;
      const normalizedAngle = newAngle % 360; // 0-359
      const winningIndex = Math.floor(normalizedAngle / sliceAngle);

      // The slice at the top is (books.length - 1 - winningIndex)
      const actualIndex = books.length - 1 - winningIndex;
      const finalIndex = (actualIndex + books.length) % books.length;

      setSelectedBook(books[finalIndex]);
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
          {/* If no book selected yet, show wheel */}
          {!selectedBook ? (
            <>
              <h1 style={styles.title}>📖 Spin the Wheel!</h1>
              {books.length > 0 ? (
                <div style={styles.wheelArea}>
                  {/* Arrow / Pointer */}
                  <div style={styles.arrow} />

                  {/* Wheel itself */}
                  <div
                    style={{
                      ...styles.wheel,
                      transform: `rotate(${angle}deg)`,
                      background: buildConicGradient(books),
                    }}
                  />

                  {/* Overlays for each slice (book covers or titles) */}
                  {books.map((book, i) => {
                    const sliceAngle = 360 / books.length;
                    const labelAngle = (i + 0.5) * sliceAngle;
                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.sliceLabel,
                          transform: `translate(-50%, -50%) 
                                      rotate(${labelAngle}deg) 
                                      translate(90px) 
                                      rotate(-${labelAngle}deg)`,
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

                  <button style={styles.spinButton} onClick={spinWheel} disabled={spinning}>
                    {spinning ? "Spinning..." : "Spin"}
                  </button>
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
              <button style={styles.spinAgainButton} onClick={spinAgain}>
                🔄 Spin Again
              </button>
            </div>
          )}
          <button style={styles.exitButton} onClick={exitGame}>
            Exit Game
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#F5E1C8",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "500px",
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
    width: "250px",
    height: "250px",
  },
  wheel: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "5px solid #222",
    transition: "transform 3s ease-out",
  },
  arrow: {
    position: "absolute",
    // Put the arrow at the top center of the wheel
    top: "-35px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "15px solid transparent",
    borderRight: "15px solid transparent",
    borderBottom: "35px solid #FF0000", // arrow color
  },
  sliceLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    pointerEvents: "none", // let clicks pass through
  },
  sliceCover: {
    width: "40px",
    height: "60px",
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
  spinButton: {
    marginTop: "20px",
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
    marginTop: "15px",
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
  exitButton: {
    marginTop: "20px",
    border: "none",
    padding: "10px 14px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    fontWeight: "bold",
    color: "white",
    background: "#8B5E3C",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
};

export default SpinWheel;
