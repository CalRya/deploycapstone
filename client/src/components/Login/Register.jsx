import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const API_URL = import.meta.env.VITE_API_URL || "https://deploycapstone.onrender.com";
const REGISTER_URL = `${API_URL}/register`;

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();

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

    try {
      const result = await axios.post(REGISTER_URL, { email, user, password: pwd }, { withCredentials: true });

      const { id, email: newEmail, role } = result.data;
      if (id && newEmail && role) {
        localStorage.setItem("currentUser", JSON.stringify({ id, email: newEmail, role }));
        setSuccess(true);
        setTimeout(() => navigate("/home"), 2000); // Redirect after success
      }

      // Reset fields only on successful registration
      setEmail("");
      setUser("");
      setPwd("");
      setMatchPwd("");
    } catch (err) {
      console.error("❌ Registration Error:", err);
      if (err.response?.data?.message) {
        setErrMsg(err.response.data.message);
      } else {
        setErrMsg("Failed to create user. Please try again.");
      }
    }
  };

  return (
    <>
      {success ? (
        <section>
          <h2>Registration successful! Redirecting...</h2>
        </section>
      ) : (
        <section>
          <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
            {errMsg}
          </p>
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

            <label htmlFor="password">
              Password:
              <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
            />
            {pwd && !validPwd && (
              <p className="instructions">
                8 to 24 characters. Must include uppercase, lowercase, a number, and a special character (!@#$%).
              </p>
            )}

            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
            />
            {matchPwd && !validMatch && <p className="instructions">Must match the first password field.</p>}

            <button
              type="submit"
              disabled={!validName || !validPwd || !validMatch}
              style={{ padding: "15px", fontSize: "18px", width: "100%", cursor: "pointer" }}
            >
              Sign Up
            </button>
          </form>

          <p>
            Already registered?{" "}
            <Link to="/login" className="btn-inline">
              Sign In
            </Link>
          </p>
        </section>
      )}
    </>
  );
};

export default Register;
