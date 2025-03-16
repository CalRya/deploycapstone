import React, { useState, useEffect } from "react";

const Premium = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://deploycapstone.onrender.com/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setUserData(data);
        setError(null);
      } catch (error) {
        console.error("❌ Error fetching user data:", error.message);
        setError(error.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>⚠️ {error}</p>;
  if (!userData) return <p>Error loading user data.</p>;

  const isPremium = userData?.premium?.status === "lifetime";

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Premium Membership</h2>
      {isPremium ? (
        <p style={styles.success}>✅ You are a Lifetime Premium Member!</p>
      ) : (
        <button style={styles.button}>Request Lifetime Premium</button>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f7f1e3",
    borderRadius: "10px",
    marginTop: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  heading: {
    color: "#8B4513",
  },
  success: {
    color: "green",
  },
  button: {
    backgroundColor: "#8B4513",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
    fontSize: "16px",
    marginTop: "10px",
  },
};

export default Premium;
