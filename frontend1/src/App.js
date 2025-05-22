import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        {/* Outras rotas aqui */}
      </Routes>
    </Router>
  );
}

export default App;
