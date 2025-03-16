import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import "../css/Register.css";
import App from "../../App";
import { Link } from "react-router-dom";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const API_URL = import.meta.env.VITE_API_URL || "https://deploycapstone.onrender.com";
const REGISTER_URL = `${API_URL}/register`;

const Register = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState("");
    const [user, setUser] = useState("");
    const [validName, setValidName] = useState(false);

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);

    const [matchPwd, setMatchPwd] = useState("");
    const [validMatch, setValidMatch] = useState(false);

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);

    useEffect(() => {
        setErrMsg("");
    }, [user, pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validName || !validPwd || !validMatch) {
            setErrMsg("Invalid input, please check your details.");
            return;
        }

        const formData = { email, user, password: pwd };
        console.log("Submitting data: ", formData);

        try {
            const result = await axios.post(REGISTER_URL, formData, { withCredentials: true });
            console.log("Response from backend: ", result.data);
            setSuccess(true);
        } catch (err) {
            console.error("❌ Registration Error:", err);
            setErrMsg("Failed to create user. Please try again.");
        }

        setEmail("");
        setUser("");
        setPwd("");
        setMatchPwd("");
    };

    return (
        <>
            {success ? (
                <App />
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
                    <h1>Register</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />

                        <label htmlFor="username">
                            Username:
                            <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                        />

                        <label htmlFor="confirm_pwd">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                        />

                        {/* Explicitly set the button type to submit */}
                        <button type="submit" disabled={!validName || !validPwd || !validMatch}>Sign Up</button>
                    </form>

                    <p>Already registered? <Link to="/login">Sign In</Link></p>
                </section>
            )}
        </>
    );
};

export default Register;
