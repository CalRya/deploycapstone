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
            data = data.slice(0, 5);

            const formattedBooks = data.map((book, index) => ({
                segmentText: book.bookTitle,
                segColor: getWheelColors(index),
                coverImage: book.bookCoverUrl ? `https://deploycapstone.onrender.com${book.bookCoverUrl}` : null,
                fontSize: adjustFontSize(book.bookTitle),
            }));

            setBooks(formattedBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const adjustFontSize = (title) => {
        if (!title) return "16px";
        const length = title.length;
        if (length < 15) return "16px";
        if (length < 25) return "14px";
        if (length < 35) return "12px";
        return "10px";
    };

    const getWheelColors = (index) => {
        const colors = ["#C19A6B", "#8B5E3C", "#D2B48C", "#A67B5B", "#7D4E2D"];
        return colors[index % colors.length];
    };

    const startGame = async () => {
        if (!gameStarted) {
            setGameStarted(true);
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

    const spinWheel = () => {
        if (spinning || books.length === 0) return;
        setSpinning(true);

        const randomSpin = Math.floor(Math.random() * 360) + 1800; // Ensures multiple full spins
        setAngle(randomSpin);

        setTimeout(() => {
            const winningIndex = Math.floor((randomSpin % 360) / (360 / books.length));
            setSelectedBook(books[winningIndex]);
            setSpinning(false);
        }, 3000); // Matches animation duration
    };

    return (
        <div style={styles.container}>
            {!gameStarted ? (
                <div style={styles.startScreen}>
                    <h2 style={styles.title}>📚 Spin the Wheel & Get a Book Recommendation!</h2>
                    <button style={styles.button} onClick={startGame}>Start Game</button>
                </div>
            ) : (
                <>
                    {!selectedBook ? (
                        <>
                            <h1 style={styles.title}>📖 Spin the Wheel!</h1>
                            {books.length > 0 ? (
                                <div style={styles.wheelContainer}>
                                    <div style={{ ...styles.wheel, transform: `rotate(${angle}deg)` }} />
                                    <button onClick={spinWheel} disabled={spinning} style={styles.spinButton}>
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
                        <div style={styles.resultContainer}>
                            <h2 style={styles.resultText}>📚 Your Recommendation:</h2>
                            {selectedBook.coverImage ? (
                                <img src={selectedBook.coverImage} alt="Book Cover" style={styles.bookCover} />
                            ) : (
                                <p style={{ fontSize: "18px", color: "gray" }}>No cover available</p>
                            )}
                            <h3 style={styles.resultTitle}>{selectedBook.segmentText}</h3>
                            <button style={styles.spinAgainButton} onClick={spinAgain}>🔄 Spin Again</button>
                        </div>
                    )}
                    <button style={styles.exitButton} onClick={exitGame}>Exit Game</button>
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
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
    },
    wheel: {
        width: "200px",
        height: "200px",
        background: "conic-gradient(#C19A6B, #8B5E3C, #D2B48C, #A67B5B, #7D4E2D)",
        borderRadius: "50%",
        border: "5px solid #222",
        transition: "transform 3s ease-out",
    },
    resultContainer: {
        textAlign: "center",
        marginTop: "20px",
    },
    bookCover: {
        width: "180px",
        height: "250px",
        objectFit: "cover",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        marginTop: "10px",
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
    },
};

export default SpinWheel;
