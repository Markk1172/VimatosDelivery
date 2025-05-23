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
import FilaPedidos from './components/FilaPedidos'; 
import EntregaRetirada from './components/EntregaRetirada';
import Cadastros from './components/Cadastros';

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
        <Route path="/fila-pedidos" element={<FilaPedidos nomeCliente="Amanda Beatriz" />} /> 
        <Route path="/entrega" element={<EntregaRetirada />} /> 
        <Route path="/cadastros" element={<Cadastros />} />
      </Routes>
    </Router>
  );
}

export default App;
