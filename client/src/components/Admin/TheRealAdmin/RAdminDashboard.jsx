import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../Navbar/NavbarAdmin"; // <-- Adjust path if needed
import UserTable from "./UserTable";
import AddUserForm from "./AddUserForm";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3004/api/users");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // ✅ Ensure premium status is included
      const updatedUsers = data.map((user) => ({
        ...user,
        premium: user.premium || { status: "basic" }, // Default to "basic" if missing
      }));

      setUsers(updatedUsers);
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
      const response = await fetch(`http://localhost:3004/api/users/${userId}`, {
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

  // Inline styles
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

  return (
    <>
      {/* Admin Navbar at the top */}
      <NavbarAdmin />
      
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

        {/* User Table (Now includes Premium Status) */}
        <UserTable
          users={filteredUsers}
          refreshUsers={fetchUsers}
          onRoleChange={handleRoleChange}
        />

        {/* Add User Section */}
        <div style={styles.addUserSection}>
          <AddUserForm refreshUsers={fetchUsers} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
