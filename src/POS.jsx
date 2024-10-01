import React from 'react';
import { Link } from 'react-router-dom';

const POS = () => {
  return (
    <div className="pos-container">
      <div className="button-container">
        <Link to="/Order" className="pos-button">Cashier</Link>
        <Link to="/OrderManagement" className="pos-button">Manage Orders</Link>
        <Link to="/Manager" className="pos-button">Manager</Link>
        <Link to="/EmployeeAdmin" className="pos-button">Administrator</Link>
        <Link to="/Login" className="pos-button sign-in-button">Sign In</Link>
      </div>
    </div>
  );
};

export default POS;
