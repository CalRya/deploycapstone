import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Login/Context/AuthoProv";
import "../css/Navbar.css";
import logo from "../../assets/logo.png";

const NavbarReal = () => {
  const { setAuth } = useContext(AuthContext);
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setAuth({});
    localStorage.removeItem("currentUser");
    sessionStorage.clear();
    window.location.assign("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar ${sticky ? "dark-nav" : ""}`}>
      <div className="nav-left">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </div>

      <ul className={`nav-links ${menuOpen ? "nav-active" : ""}`}>
        <li>
          <button className="btn" onClick={handleLogout}>Log Out</button>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarReal;
