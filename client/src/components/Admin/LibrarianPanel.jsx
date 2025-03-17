import React, { useEffect, useState } from "react";

const LibrarianPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                console.log("📡 Requesting premium requests...");
                const response = await fetch("https://deploycapstone.onrender.com/api/premium/premium-requests");

                console.log("🔄 Response Status:", response.status);
                if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

                const data = await response.json();
                console.log("📥 Fetched Data:", JSON.stringify(data, null, 2));
                setRequests(data);
            } catch (error) {
                console.error("❌ Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            const response = await fetch(`https://deploycapstone.onrender.com/api/premium/approve-premium/${id}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Approval failed");
            alert("✅ Approved successfully!");

            // Update state to remove the approved request
            setRequests((prev) => prev.filter(req => req._id !== id));
        } catch (error) {
            alert("❌ Error approving request");
            console.error(error);
        }
    };

    const handleDeny = async (id) => {
        try {
            const response = await fetch(`https://deploycapstone.onrender.com/api/premium/reject-premium/${id}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Rejection failed");
            alert("❌ Request denied!");

            // Update state to remove the denied request
            setRequests((prev) => prev.filter(req => req._id !== id));
        } catch (error) {
            alert("❌ Error denying request");
            console.error(error);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Librarian Panel - Premium Requests</h2>
            {loading ? (
                <p style={styles.loadingText}>Loading requests...</p>
            ) : requests.length === 0 ? (
                <p style={styles.noRequests}>No pending requests.</p>
            ) : (
                requests.map(request => (
                    <div key={request._id} style={styles.requestCard}>
                        <p style={styles.requestText}>
                            <strong style={styles.userName}>
                                {request.user?.username || request.user?.email || "Unknown User"}
                            </strong> 
                            <span style={styles.statusText}> - Status: {request.status}</span>
                        </p>
                        <button 
                            onClick={() => handleApprove(request._id)} 
                            disabled={request.status !== "pending"}
                            style={request.status === "pending" ? styles.approveButton : styles.disabledButton}
                        >
                            Approve
                        </button>
                        <button 
                            onClick={() => handleDeny(request._id)} 
                            disabled={request.status !== "pending"}
                            style={request.status === "pending" ? styles.denyButton : styles.disabledButton}
                        >
                            Deny
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

// ✅ Styled inline CSS object
const styles = {
    container: {
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#F5E6C8",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
    },
    heading: {
        fontSize: "22px",
        fontWeight: "bold",
        color: "#5D4037",
        marginBottom: "15px",
    },
    loadingText: {
        fontSize: "16px",
        color: "#795548",
    },
    noRequests: {
        fontSize: "16px",
        color: "#795548",
        fontStyle: "italic",
    },
    requestCard: {
        backgroundColor: "#FFF",
        padding: "15px",
        borderRadius: "8px",
        margin: "10px 0",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        textAlign: "left",
    },
    requestText: {
        marginBottom: "10px",
        color: "#5D4037",
        fontSize: "16px",
    },
    userName: {
        fontWeight: "bold",
        color: "#3E2723",
    },
    statusText: {
        fontSize: "14px",
        color: "#795548",
    },
    approveButton: {
        backgroundColor: "#8D6E63",
        color: "#FFF",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        marginRight: "10px",
        transition: "background 0.3s",
    },
    denyButton: {
        backgroundColor: "#D32F2F",
        color: "#FFF",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "background 0.3s",
    },
    disabledButton: {
        backgroundColor: "#D7CCC8",
        color: "#5D4037",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "not-allowed",
    }
};

export default LibrarianPanel;
