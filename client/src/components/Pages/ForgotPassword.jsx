// /src/components/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error sending reset link");
    }
  };

  return (
    <section>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="forgot-email">Email:</label>
        <input
          type="email"
          id="forgot-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
      {/* Back Button */}
      <button onClick={() => navigate("/login")}>Back to Login</button>
    </section>
  );
};

export default ForgotPassword;
