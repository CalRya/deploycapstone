import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // No need for '../api/axios' unless you configured it
import '../css/Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrMsg('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

            const response = await axios.post(
                `${API_URL}/login`, 
                { email, password },
                { withCredentials: true } // 🔹 Ensures cookies work (important for CORS)
            );

            console.log("✅ Server Response:", response.data);

            if (response.data?.message?.includes("Login successful")) {
                const { id, email, role } = response.data;

                if (!id || !email || !role) {
                    setErrMsg("Login error: Missing user details.");
                    return;
                }

                localStorage.setItem("currentUser", JSON.stringify({ id, email, role }));

                switch (role) {
                    case 'admin': navigate('/adminmanage'); break;
                    case 'librarian': navigate('/homeadmin'); break;
                    case 'courier': navigate('/courierhome'); break;
                    default: navigate('/home');
                }
            } else {
                setErrMsg("Invalid credentials.");
            }
        } catch (err) {
            console.error("❌ Login Error:", err);
            setErrMsg(err.response?.data?.error || "Login failed. Please try again.");
        }
    };

    return (
        <section>
            {errMsg && <p ref={errRef} className="errmsg">{errMsg}</p>}
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>

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
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />

                <button type="submit">Sign In</button>
            </form>

            <p>Need an Account? <Link to="/register">Sign Up</Link></p>
        </section>
    );
}

export default Login;
