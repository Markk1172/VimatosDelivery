import React from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Teams from './components/Teams';
import Contact from './components/contact'; // <-- Adicione esta linha
import Footer from './components/Footer';
import PortfolioModals from './components/portflioModal';

function App() {
  return (
    <>
      <Navbar />
      <Header />
      <Services />
      <Portfolio />
      <About />
      <Teams />
      <Contact /> {/* <-- Adicione aqui */}
      <Footer />
      <PortfolioModals />
    </>
  );
}

export default App;