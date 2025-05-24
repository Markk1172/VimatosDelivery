import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Seus componentes de página
import Navbar from './components/Navbar'; // Navbar não precisa estar aqui se cada página a renderiza
import Header from './components/Header';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Teams from './components/Teams';
import Contact from './components/contact'; // Verifique o nome do arquivo, geralmente é Contact.jsx
import Footer from './components/Footer';
import PortfolioModals from './components/portflioModal'; // Verifique o nome do arquivo
import Login from './components/Login';
import FilaPedidos from './components/FilaPedidos'; 
import EntregaRetirada from './components/EntregaRetirada';
import Cadastros from './components/Cadastros';
import ClienteEdit from './components/ClienteEdit'; 

// Importe a rota protegida corretamente
import FuncionarioRoute from './components/FuncionarioRoute'; // <<< CORREÇÃO NO NOME DO ARQUIVO

// Componente Home agrupando os componentes da página inicial
function Home() {
  return (
    <>
      <Navbar /> {/* Se a Navbar for comum a todas as páginas da Home */}
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

// (Opcional) Componente para página não encontrada ou não autorizada
const NotFound = () => (
    <div>
        <Navbar /> {/* Pode querer a Navbar aqui também */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Página não encontrada ou acesso não autorizado.</h2>
            <p>Verifique o endereço URL ou <a href="/login">faça login</a>.</p>
        </div>
    </div>
);


function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas e de Cliente */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile/edit" element={<ClienteEdit />} /> 

        {/* Rotas Protegidas para Funcionários */}
        <Route element={<FuncionarioRoute />}>  {/* <<< ESTA É A ROTA PAI PROTETORA */}
          {/* As rotas abaixo só serão acessíveis se FuncionarioRoute permitir */}
          <Route path="/fila-pedidos" element={<FilaPedidos />} /> 
          <Route path="/entrega-retirada" element={<EntregaRetirada />} />
          <Route path="/cadastros" element={<Cadastros />} />
          {/* Adicione outras rotas de funcionário aqui dentro */}
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
