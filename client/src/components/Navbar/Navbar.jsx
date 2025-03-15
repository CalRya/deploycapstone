import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Using NavLink for active highlighting
import '../css/Navbar.css';
import logo from '../../assets/logo.png';

const Navbar = ({ onSearch }) => {
  const [sticky, setSticky] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // toggles mobile menu
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchInput(query);
    onSearch && onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      navigate(searchInput.trim() ? `/lib?q=${encodeURIComponent(searchInput.trim())}` : '/lib');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar ${sticky ? 'dark-nav' : ''}`}>
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

      <ul className={`nav-links ${menuOpen ? 'nav-active' : ''}`}>
        <li>
          <NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/lib" className={({ isActive }) => isActive ? "active" : ""}>
            Library
          </NavLink>
        </li>
        <li>
          <NavLink to="/bookhistory" className={({ isActive }) => isActive ? "active" : ""}>
            History
          </NavLink>
        </li>
        <li>
          <NavLink to="/gamesh" className={({ isActive }) => isActive ? "active" : ""}>
            Games
          </NavLink>
        </li>
        <li>
          <NavLink to="/courierp" className={({ isActive }) => isActive ? "active" : ""}>
            Courier
          </NavLink>
        </li>
        <li>
          <NavLink to="/prof" className={({ isActive }) => isActive ? "active profile-link" : "profile-link"}>
            Profile
          </NavLink>
        </li>
        <li>
          <button className="btn">
            <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>
              Log Out
            </NavLink>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
