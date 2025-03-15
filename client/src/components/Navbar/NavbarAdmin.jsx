import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../Login/Context/AuthoProv";
import "../css/Navbar.css";
import logo from "../../assets/logo.png";

const NavbarAdmin = ({ onSearch }) => {
  const { setAuth } = useContext(AuthContext);
  const [sticky, setSticky] = useState(false);
  const [searchInput, setSearchInput] = useState("");
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
    onSearch && onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (searchInput.trim() === "") {
        navigate("/lib");
      } else {
        navigate(`/lib?q=${encodeURIComponent(searchInput.trim())}`);
      }
    }
  };

  const handleLogout = () => {
    setAuth({});
    localStorage.removeItem("currentUser");
    sessionStorage.clear();
    navigate("/login", { replace: true });
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

      <ul className="nav-links">
        <li>
          <NavLink to="/homeadmin" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/digilibadmin" className={({ isActive }) => (isActive ? "active" : "")}>
            Manage Books
          </NavLink>
        </li>
        <li>
          <NavLink to="/libadmin" className={({ isActive }) => (isActive ? "active" : "")}>
            Library
          </NavLink>
        </li>
        <li>
          <NavLink to="/profadmin" className={({ isActive }) => (isActive ? "active" : "")}>
            Profile
          </NavLink>
        </li>
        <li>
          <button className="btn" onClick={handleLogout}>
            Log Out
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarAdmin;
