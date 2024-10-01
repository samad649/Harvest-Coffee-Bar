import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import './Navbar.css';
import Weather from './Weather';
import GoogleTranslateComponent from "./GoogleTranslate";          


const Navbar = () => {

  return (
    <nav className="navbar-container">
      <ul className="navbar">
        <li className="nav-link">
          <Link className="link-style" to="/POS">Employee Portal</Link>
        </li>
        <li className="nav-link">
          <Link className="link-style" to="/Home">Home</Link>
        </li>
        <li className="nav-link">
          <Link className="link-style" to="/CustomerOrder">Order Online</Link>
        </li>
        <li className="weather-container">
          <Weather />
        </li>
        <li>
          <GoogleTranslateComponent />
        </li>
        
      </ul>
    </nav>
  );
};

export default Navbar;
