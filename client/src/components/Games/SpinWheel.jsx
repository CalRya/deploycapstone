import React, { useState, useEffect } from "react";
import { RoulettePro } from "react-roulette-pro";
import "react-roulette-pro/dist/index.css";

const SpinWheel = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [prizeIndex, setPrizeIndex] = useState(null);

    const fetchRandomBooks = async () => {
        try {
            const response = await fetch("https://deploycapstone.onrender.com/api/books/random?limit=5");
            if (!response.ok) throw new Error("Failed to fetch books");

            let data = await response.json();
            if (!data || data.length === 0) throw new Error("No books received");

            data = data.slice(0, 5);

            const formattedBooks = data.map((book, index) => ({
                option: book.bookTitle || `Book ${index + 1}`,
                style: { backgroundColor: getWheelColors(index) },
                coverImage: book.bookCoverUrl ? `https://deploycapstone.onrender.com${book.bookCoverUrl}` : null,
            }));

            console.log("Fetched Books:", formattedBooks);
            setBooks(formattedBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
            setBooks([]);
        }
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

        const randomIndex = Math.floor(Math.random() * books.length);
        console.log("Selected Prize Index:", randomIndex);
        setPrizeIndex(randomIndex);
    };

    const handlePrizeDefined = () => {
        if (prizeIndex === null || prizeIndex >= books.length) {
            console.error("Invalid prize index:", prizeIndex);
            setSpinning(false);
            return;
        }
        console.log("Prize Selected:", books[prizeIndex]);
        setSelectedBook(books[prizeIndex]);
        setSpinning(false);
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
                                    <RoulettePro
                                        prizes={books.length > 0 ? books : [{ option: "No Books Available" }]}
                                        mustStartSpinning={spinning}
                                        prizeIndex={prizeIndex ?? 0}
                                        onPrizeDefined={handlePrizeDefined}
                                    />
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
                            <h3 style={styles.resultTitle}>{selectedBook.option}</h3>
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
