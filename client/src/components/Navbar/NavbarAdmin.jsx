import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../Login/Context/AuthoProv";
import "../css/Navbar.css";
import logo from "../../assets/logo.png";

const NavbarAdmin = ({ onSearch }) => {
  const { setAuth } = useContext(AuthContext);
  const [sticky, setSticky] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // Added for hamburger menu
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchInput(query);
    if (onSearch) onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      navigate(searchInput.trim() ? `/lib?q=${encodeURIComponent(searchInput.trim())}` : "/lib");
    }
  };

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

      <input
        type="text"
        placeholder="Search for books..."
        value={searchInput}
        onChange={handleSearch}
        onKeyDown={handleKeyPress}
        className="search-bar"
      />

      <div className="hamburger" onClick={toggleMenu}>
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </div>

      <ul className={`nav-links ${menuOpen ? "nav-active" : ""}`}>
        <li><NavLink to="/homeadmin">Home</NavLink></li>
        <li><NavLink to="/digilibadmin">Manage Books</NavLink></li>
        <li><NavLink to="/libadmin">Library</NavLink></li>
        <li><NavLink to="/profadmin">Profile</NavLink></li>
        <li><button className="btn" onClick={handleLogout}>Log Out</button></li>
      </ul>
    </nav>
  );
};

export default NavbarAdmin;
