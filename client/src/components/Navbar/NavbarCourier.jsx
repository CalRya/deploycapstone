import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../css/Navbar.css';
import logo from '../../assets/logo.png';

const NavbarCourier = ({ onSearch }) => {
  const [sticky, setSticky] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // Added for hamburger menu
  const navigate = useNavigate();
  const location = useLocation();

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
      const path = location.pathname;
      navigate(searchInput.trim() ? `${path}?q=${encodeURIComponent(searchInput.trim())}` : path);
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
        <li><NavLink to="/courierhome">Home</NavLink></li>
        <li><NavLink to="/courierlibrary">Library</NavLink></li>
        <li><NavLink to="/courierhistory">History</NavLink></li>
        <li><NavLink to="/couriergamehome">Games</NavLink></li>
        <li><NavLink to="/courierarticles">Articles</NavLink></li>
        <li><NavLink to="/courierprofile">Profile (Courier)</NavLink></li>
        <li>
          <button className="btn">
            <NavLink to="/login">Log Out</NavLink>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarCourier;
