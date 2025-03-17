import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";

// Username: Letters, digits, underscore, hyphen, 4-24 chars, must start with letter
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;

// Password: 8-24 chars, must have uppercase, lowercase, digit, special char from (!@#$%)
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const API_URL = import.meta.env.VITE_API_URL || "https://deploycapstone.onrender.com";
const REGISTER_URL = `${API_URL}/register`;

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate(); // for redirecting after successful sign up

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
    console.log("handleSubmit triggered");

    // Double-check client-side validation
    if (!validName || !validPwd || !validMatch) {
      setErrMsg("Invalid input, please check your details.");
      return;
    }

    const formData = { email, user, password: pwd };
    console.log("Submitting data: ", formData);

    try {
      const result = await axios.post(REGISTER_URL, formData, { withCredentials: true });
      console.log("Response from backend: ", result.data);

      const { id, email: newEmail, role } = result.data;
      if (id && newEmail && role) {
        localStorage.setItem("currentUser", JSON.stringify({ id, email: newEmail, role }));
        setSuccess(true); // Registration succeeded
        navigate("/home"); // Redirect to home or any page after successful registration
      }
    } catch (err) {
      console.error("❌ Registration Error:", err);
      if (err.response && err.response.data) {
        setErrMsg(err.response.data.message || "Failed to create user. Please try again.");
      } else {
        setErrMsg("Failed to create user. Please try again.");
      }
    }

    // Clear the form fields after submission
    setEmail("");
    setUser("");
    setPwd("");
    setMatchPwd("");
  };

  return (
    <>
      {success ? (
        <section>
          <h2>Registration successful! You will be redirected to home...</h2>
        </section>
      ) : (
        <section>
          <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>
            {errMsg}
          </p>
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />

            {/* Username */}
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

            {/* Password */}
            <label htmlFor="password">
              Password:
              <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => {
                setPwd(e.target.value);
                // Debug log to confirm if your password meets the regex
                console.log("pwd:", e.target.value, "validPwd:", PWD_REGEX.test(e.target.value));
              }}
              value={pwd}
              required
            />
            {/* Show a warning if the user typed something and it's invalid */}
            {pwd && !validPwd && (
              <p className="instructions">
                8 to 24 characters.
                <br />
                Must include uppercase [A-Z], lowercase [a-z], a digit [0-9], and
                special character (!@#$%).
              </p>
            )}

            {/* Confirm Password */}
            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon
                icon={faCheck}
                className={validMatch && matchPwd ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validMatch || !matchPwd ? "hide" : "invalid"}
              />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
            />
            {/* Show a warning if the user typed something but doesn't match the password */}
            {matchPwd && !validMatch && (
              <p className="instructions">Must match the first password field.</p>
            )}

            <button
              type="submit"
              disabled={!validName || !validPwd || !validMatch}
              style={{
                padding: "15px",
                fontSize: "18px",
                width: "100%",
                cursor: "pointer",
              }}
            >
              Sign Up
            </button>
          </form>

          <p>
            Already registered? <Link to="/login">Sign In</Link>
          </p>
        </section>
      )}
    </>
  );
};

export default Register;
