import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../css/Navbar.css';
import logo from '../../assets/logo.png';

const NavbarCourier = ({ onSearch }) => {
  const [sticky, setSticky] = useState(false);
  const [searchInput, setSearchInput] = useState('');
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
      if (path.includes("courierlibrary")) {
        navigate(
          searchInput.trim()
            ? `/courierlibrary?q=${encodeURIComponent(searchInput.trim())}`
            : '/courierlibrary'
        );
      } else if (path.includes("lib")) {
        navigate(
          searchInput.trim()
            ? `/lib?q=${encodeURIComponent(searchInput.trim())}`
            : '/lib'
        );
      }
    }
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
      <ul className="nav-links">
        <li>
          <NavLink to="/courierhome" className={({ isActive }) => isActive ? "active" : ""}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/courierlibrary" className={({ isActive }) => isActive ? "active" : ""}>
            Library
          </NavLink>
        </li>
        <li>
          <NavLink to="/courierhistory" className={({ isActive }) => isActive ? "active" : ""}>
            History
          </NavLink>
        </li>
        <li>
          <NavLink to="/couriergamehome" className={({ isActive }) => isActive ? "active" : ""}>
            Games
          </NavLink>
        </li>
        <li>
          <NavLink to="/courierarticles" className={({ isActive }) => isActive ? "active" : ""}>
            Articles
          </NavLink>
        </li>
        <li>
          <NavLink to="/courierprofile" className={({ isActive }) => isActive ? "active profile-link" : "profile-link"}>
            Profile (Courier)
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

export default NavbarCourier;
