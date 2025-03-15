import React, { useState, useEffect } from "react";
import UserTable from "./UserTable";
import AddUserForm from "./AddUserForm";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Check for the current user in localStorage.
    const currentUser = localStorage.getItem("currentUser");

    useEffect(() => {
        // Only fetch users if an admin is logged in.
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const response = await fetch("https://deploycapstone.onrender.com/api/users");
            if (!response.ok) {
                // Optionally, if you get a 404, set users to an empty array.
                if (response.status === 404) {
                    setUsers([]);
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // 🔄 Handle Role Change
    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`https://deploycapstone.onrender.com/api/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update role. Status: ${response.status}`);
            }

            console.log(`✅ Role updated for user ${userId} to ${newRole}`);
            fetchUsers(); // Refresh user list after update
        } catch (error) {
            console.error("❌ Error updating role:", error.message);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.user && user.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Inline styles remain unchanged
    const styles = {
        dashboard: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "90%",
            maxWidth: "1200px",
            margin: "40px auto",
            padding: "60px",
            backgroundColor: "#F5F5DC", // Beige background
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        },
        header: {
            fontSize: "28px",
            color: "#5A3E2B", // Dark brown
            marginBottom: "20px",
            textAlign: "center",
        },
        controls: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#8B5A2B", // Brown
            borderRadius: "8px",
        },
        input: {
            padding: "10px",
            width: "100%",
            maxWidth: "300px",
            border: "1px solid #5A3E2B",
            borderRadius: "5px",
            fontSize: "16px",
            backgroundColor: "#FAEBD7",
            color: "#5A3E2B",
        },
        addUserSection: {
            marginTop: "30px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
        },
    };

    // If there's no current user (i.e. admin has logged out), show a friendly message.
    if (!currentUser) {
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Please log in to access the admin dashboard.</h2>
          </div>
        );
    }

    return (
        <div style={styles.dashboard}>
            <h1 style={styles.header}>📊 Admin Dashboard</h1>
            
            {/* Search Users Section */}
            <div style={styles.controls}>
                <input
                    type="text"
                    placeholder="🔎 Search users..."
                    value={searchQuery}
                    onChange={handleSearch}
                    style={styles.input}
                />
            </div>

            {/* User Table (Now includes Role Editing) */}
            <UserTable 
                users={filteredUsers} 
                refreshUsers={fetchUsers} 
                onRoleChange={handleRoleChange} // Pass function to UserTable
            />

            {/* Add User Section */}
            <div style={styles.addUserSection}>
                <AddUserForm refreshUsers={fetchUsers} />
            </div>
        </div>
    );
};

export default AdminDashboard;
