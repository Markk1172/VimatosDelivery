import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Header from './components/Header';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Teams from './components/Teams';
import Contact from './components/contact';
import Footer from './components/Footer';
import PortfolioModals from './components/portflioModal';
import Login from './components/Login';

function Home() {
  return (
    <>
      <Navbar />
      <Header />
      <Services />
      <Portfolio />
      <About />
      <Teams />
      <Contact />
      <Footer />
      <PortfolioModals />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
