import React from 'react';
import { Route } from 'react-router-dom';
import Home from '../components/Home';
import About from '../components/About';

const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </>
  );
};

export default PublicRoutes;
