import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import '../css/Navbar.css';
import logo from '../../assets/logo.png';

const NavbarReal = () => {
  const [sticky, setSticky] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${sticky ? "dark-nav" : ""}`}>
      <img src={logo} alt="Logo" className="logo" />
      <ul style={styles.navList}>
        <li>
          <button style={styles.btn}>
            <NavLink to="login" className={({ isActive }) => isActive ? "active" : ""}>
              Log Out
            </NavLink>
          </button>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  navList: {
    display: "flex",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "20px",
  },
  btn: {
    backgroundColor: "#8E735B",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
};

export default NavbarReal;
