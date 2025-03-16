import React, { useEffect, useState } from 'react';
import NavbarCourier from '../../Navbar/NavbarCourier';
import Premium from "../../Profile/Premium";

function Prof() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            console.warn("⚠️ No user found in localStorage.");
        }
    }, []);

    console.log("🔍 Debug: currentUser", currentUser);

    if (!currentUser) {
        return (
            <main className="App">
                <NavbarCourier />
                <div style={{ marginTop: "80px", padding: "20px" }}>
                    <p>Loading user...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="App">
            <NavbarCourier />
            <div style={{ marginTop: "80px", padding: "20px" }}>
                <section>
                    <h1>User Profile</h1>
                    <p>Email: {currentUser.email}</p>
                    <p>Role: {currentUser.role}</p>
                </section>

                {/* Removed the UserProfile component that had the "save changes" button */}

                <section style={{ marginTop: "20px" }}>
                    <Premium userId={currentUser.id} />
                </section>
            </div>
        </main>
    );
}

export default Prof;
