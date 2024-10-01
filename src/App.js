import './App.css';
import React from 'react';
import Navbar from './Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Order from './Order';
import Menu from './Menu';
import Home from './Home';
import Manager from './Manager';
import Login from './Login';
import POS from './POS';
import OrderManagement from './OrderManagement';
import ManagerOrder from './ManagerOrder';
import EmployeeAdmin from './EmployeeAdmin';
import CustomerOrder from './CustomerOrder';

import IngredientInfo from './IngredientInfo';

import { UserProvider } from './UserContext';

function App() {
  return (
    <>
      <Router>
      <UserProvider>
          <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/Order" element={<Order />} />
              <Route path="/Manager" element={<Manager />} />
              <Route path="/Manager/:ingreidentName" element={<IngredientInfo />}/>
              <Route path="/Menu" element={<Menu />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/POS" element={<POS />} />
              <Route path="/OrderManagement" element={<OrderManagement />} />
              <Route path="/ManagerOrder" element={<ManagerOrder />} />
              <Route path="/EmployeeAdmin" element={<EmployeeAdmin />} />
              <Route path="/CustomerOrder" element={<CustomerOrder />} />
            </Routes>
      </UserProvider>
      </Router>
    </>
  );
}


export default App;