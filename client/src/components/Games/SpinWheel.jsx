import React, { useState, useEffect, useRef } from "react";
import { Wheel } from "react-custom-roulette";

const SpinWheel = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const wheelRef = useRef(null);

    const fetchRandomBooks = async () => {
        try {
            const response = await fetch("https://deploycapstone.onrender.com/api/books/random?limit=5");
            if (!response.ok) throw new Error("Failed to fetch books");

            let data = await response.json();
            data = data.slice(0, 5);

            const formattedBooks = data.map((book, index) => ({
                option: book.bookTitle,
                style: { backgroundColor: getWheelColors(index), textColor: "#fff" },
                coverImage: book.bookCoverUrl ? `https://deploycapstone.onrender.com${book.bookCoverUrl}` : null,
            }));

            setBooks(formattedBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
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

    const spinWheel = () => {
        if (books.length === 0) return;
        const newPrizeNumber = Math.floor(Math.random() * books.length);
        setPrizeNumber(newPrizeNumber);
        setMustSpin(true);
    };

    const handleSpinFinish = () => {
        setMustSpin(false);
        setSelectedBook(books[prizeNumber]);
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
                                    <div style={styles.arrow}></div>
                                    <Wheel
                                        mustStartSpinning={mustSpin}
                                        prizeNumber={prizeNumber}
                                        data={books}
                                        onStopSpinning={handleSpinFinish}
                                        backgroundColors={["#C19A6B", "#8B5E3C"]}
                                        textColors={["white"]}
                                        outerBorderColor="black"
                                    />
                                </div>
                            ) : (
                                <p style={{ color: "red", fontSize: "18px" }}>
                                    ❌ No books available. Check your database.
                                </p>
                            )}
                            <button style={styles.button} onClick={spinWheel}>Spin</button>
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
        maxWidth: "500px",
        margin: "40px auto",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        marginBottom: "10px",
    },
    button: {
        padding: "12px 18px",
        fontSize: "16px",
        cursor: "pointer",
        borderRadius: "20px",
        fontWeight: "bold",
        background: "#8B5E3C",
        color: "white",
    },
    exitButton: {
        marginTop: "20px",
        padding: "10px 14px",
        fontSize: "16px",
        cursor: "pointer",
        borderRadius: "20px",
        fontWeight: "bold",
        background: "#5A3E2B",
        color: "white",
    },
    wheelContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    arrow: {
        position: "absolute",
        top: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "0",
        height: "0",
        borderLeft: "15px solid transparent",
        borderRight: "15px solid transparent",
        borderBottom: "20px solid black",
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
        marginTop: "10px",
    },
};

export default SpinWheel;
