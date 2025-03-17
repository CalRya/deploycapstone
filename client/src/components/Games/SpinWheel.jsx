import React, { useState, useEffect, Suspense } from "react";

// Lazy load the SpinWheel component
const SpinWheel = React.lazy(() =>
  import("spin-wheel-game").then((module) => ({ default: module.SpinWheel }))
);

const SpinWheelGame = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Fetch random books from API
  const fetchRandomBooks = async () => {
    try {
      const response = await fetch(
        "https://deploycapstone.onrender.com/api/books/random?limit=5"
      );
      if (!response.ok) throw new Error("Failed to fetch books");

      let data = await response.json();
      console.log("Fetched books:", data);

      data = data.slice(0, 5);

      const formattedBooks = data.map((book, index) => ({
        segmentText: book.bookTitle,
        segColor: getWheelColors(index),
        fontSize: adjustFontSize(book.bookTitle),
      }));

      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // Adjust font size based on title length
  const adjustFontSize = (title) => {
    if (!title) return "16px";
    const length = title.length;
    if (length < 15) return "16px";
    if (length < 25) return "14px";
    if (length < 35) return "12px";
    return "10px";
  };

  // Generate colors for the wheel
  const getWheelColors = (index) => {
    const colors = ["#C19A6B", "#8B5E3C", "#D2B48C", "#A67B5B", "#7D4E2D"];
    return colors[index % colors.length];
  };

  // Handle spin result
  const handleSpinFinish = (selectedTitle) => {
    console.log(`Spun to: ${selectedTitle}`);
    const foundBook = books.find((book) => book.segmentText === selectedTitle);
    if (foundBook) {
      setSelectedBook(foundBook);
    }
  };

  // Start the game
  const startGame = async () => {
    setGameStarted(true);
    setSelectedBook(null);
    await fetchRandomBooks();
  };

  // Exit the game
  const exitGame = () => {
    setGameStarted(false);
    setSelectedBook(null);
  };

  // Spin again
  const spinAgain = async () => {
    setSelectedBook(null);
    await fetchRandomBooks();
  };

  // Spin Wheel settings
  const spinWheelProps = {
    segments: books,
    onFinished: handleSpinFinish,
    primaryColor: "#8B5E3C",
    contrastColor: "white",
    buttonText: "Spin",
    isOnlyOnce: false,
    size: 150,
    upDuration: 100,
    downDuration: 600,
    fontFamily: "Century Gothic",
    arrowLocation: "top",
    showTextOnSpin: false,
    isSpinSound: true,
    textStyle: {
      whiteSpace: "normal",
      wordWrap: "break-word",
      textAlign: "center",
      fontSize: books.length > 0 ? books[0].fontSize : "16px",
    },
  };

  return (
    <div style={styles.container}>
      {!gameStarted ? (
        <div style={styles.startScreen}>
          <h2 style={styles.title}>
            📚 Spin the Wheel & Get a Book Recommendation!
          </h2>
          <button style={styles.button} onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          {!selectedBook ? (
            <>
              <h1 style={styles.title}>📖 Spin the Wheel!</h1>
              {books.length > 0 ? (
                <div style={styles.wheelContainer}>
                  <Suspense fallback={<div>Loading Spin Wheel...</div>}>
                    <SpinWheel {...spinWheelProps} />
                  </Suspense>
                </div>
              ) : (
                <p style={{ color: "red", fontSize: "18px" }}>
                  ❌ No books available. Check your database.
                </p>
              )}
            </>
          ) : (
            <div style={styles.resultContainer}>
              <h2 style={styles.resultText}>📚 Your Recommendation:</h2>
              <h3 style={styles.resultTitle}>{selectedBook.segmentText}</h3>
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

// Styling
const styles = {
  container: {
    backgroundColor: "#F5E1C8",
    padding: "40px",
    borderRadius: "30px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "100%",
    margin: "30px auto",
    textAlign: "center",
    fontFamily: "Century Gothic, sans-serif",
    color: "#5a3e2b",
  },
  startScreen: {
    textAlign: "center",
    padding: "30px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
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
  wheelContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    opacity: "0.8",
    width: "100%",
    maxWidth: "600px",
  },
  resultContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  resultText: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  resultTitle: {
    fontSize: "18px",
    marginTop: "10px",
    fontWeight: "normal",
  },
};

export default SpinWheelGame;
