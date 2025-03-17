import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";

const API_URL = import.meta.env.VITE_API_URL || "https://deploycapstone.onrender.com";
const LOGIN_URL = `${API_URL}/login`;

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [passwordWarning, setPasswordWarning] = useState("");
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        // Clear any stored user data on mount
        localStorage.removeItem("currentUser");
        userRef.current?.focus();
    }, []);

    // Validate that the password has at least one uppercase letter, one special character, and one number
    const validatePassword = (pwd) => {
        const upperCaseRegex = /[A-Z]/;
        const specialCharRegex = /[\W_]/;
        const numberRegex = /[0-9]/;
        return upperCaseRegex.test(pwd) && specialCharRegex.test(pwd) && numberRegex.test(pwd);
    };

    // Handle changes in the password field and display a warning if it doesn't meet criteria
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword && !validatePassword(newPassword)) {
            setPasswordWarning("Password must contain at least 1 uppercase letter, 1 special character, and 1 number.");
        } else {
            setPasswordWarning("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Reset error message on submit
        setErrMsg("");

        if (!email || !password) {
            setErrMsg("Please fill in both fields.");
            return;
        }

        // Ensure password meets the criteria before sending the request
        if (!validatePassword(password)) {
            setErrMsg("Password must contain at least 1 uppercase letter, 1 special character, and 1 number.");
            return;
        }

        try {
            const result = await axios.post(
                LOGIN_URL,
                { email, password },
                { withCredentials: true } // Ensures cookies are sent
            );

            if (result.data?.message?.includes("Login successful")) {
                const { id, email, role } = result.data;
                if (!id || !email || !role) {
                    setErrMsg("Login error: Missing user details.");
                    return;
                }

                const userData = { id, email, role };
                localStorage.setItem("currentUser", JSON.stringify(userData));

                // Redirect based on role
                switch (userData.role) {
                    case "admin":
                        navigate("/adminmanage");
                        break;
                    case "librarian":
                        navigate("/homeadmin");
                        break;
                    case "courier":
                        navigate("/courierhome");
                        break;
                    default:
                        navigate("/home");
                }
            } else {
                setErrMsg("Invalid credentials.");
            }
        } catch (err) {
            console.error("❌ Login error:", err);
            setErrMsg(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <section>
            {errMsg && <p ref={errRef} className="errmsg">{errMsg}</p>}
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    autoComplete="off"
                    ref={userRef}
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={handlePasswordChange}
                    value={password}
                    required
                />
                {passwordWarning && <p className="password-warning">{passwordWarning}</p>}

                <button type="submit">Sign In</button>
            </form>
            <p>Need an Account? <Link to="/register">Sign Up</Link></p>
        </section>
    );
}

export default Login;
