import React from 'react';

import { BrowserRouter as Router, Route, Routes as Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Product from '../pages/Product';
import About from '../pages/About';
import Configuration from '../pages/Configuration';
import Combo from '../pages/Combo';
import UserAdministration from '../pages/User';
import Bill from '../pages/Bills';

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/product" element={<Product />} />
        <Route path="/combo" element={<Combo />} />
        <Route path="/about" element={<About />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/user" element={<UserAdministration />} />
        <Route path="/Bill" element={<Bill />} />
      </Routes>
  )
};

export default AppRoutes;
