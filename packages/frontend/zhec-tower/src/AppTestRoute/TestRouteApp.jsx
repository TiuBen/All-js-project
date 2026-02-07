import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublicRoutes from './routes/PublicRoutes';
import PrivateRoutes from './routes/PrivateRoutes';

const TestRouteApp = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </nav>

        <Routes>
          {/* Public Routes */}
          {PublicRoutes() }
          {/* Private Routes */}
          {PrivateRoutes() }
        </Routes>

        {/* <Routes> */}
          {/* Include public and private routes */}
          {/* <PublicRoutes />   This will contain the public routes */}
          {/* <PrivateRoutes />  This will contain the private routes */}
        {/* </Routes> */}
      </div>
    </Router>
  );
};

export default TestRouteApp;


