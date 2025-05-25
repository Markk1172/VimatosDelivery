import React from 'react';
// Importando tudo o que precisamos do react-router-dom (V1 e V2)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importando todos os componentes de ambas as versões
import Navbar from './components/Navbar';
import Header from './components/Header';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Teams from './components/Teams';
import Footer from './components/Footer';
import PortfolioModals from './components/portflioModal';
import Login from './components/Login';
import FilaPedidos from './components/FilaPedidos';
import EntregaRetirada from './components/EntregaRetirada';
import Cadastros from './components/Cadastros';
import ClienteEdit from './components/ClienteEdit';
import CarrinhoDeCompras from './components/CarrinhoDeCompras'; 
import Cardapio from './components/Cardapio';            
import FuncionarioRoute from './components/FuncionarioRoute'; 
import MeusPedidos from './components/MeusPedidos';

// Componente Home 
function Home() {
  return (
    <>
      <Navbar />
      <Header />
      <Services />
      <Portfolio />
      <About />
      <Teams />
      <Footer />
      <PortfolioModals />
    </>
  );
}

// Componente NotFound (da V2)
const NotFound = () => (
    <div>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Página não encontrada ou acesso não autorizado.</h2>
            <p>Verifique o endereço URL ou <a href="/login">faça login</a>.</p>
        </div>
    </div>
);

// Componente App (Mesclado)
function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas e de Cliente (Mescladas) */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile/edit" element={<ClienteEdit />} />
        <Route path="/carrinho" element={<CarrinhoDeCompras />} /> 
        <Route path="/cardapio" element={<Cardapio />} /> 
        <Route path="/pedidos" element={<MeusPedidos />} />       

        {/* Rotas Protegidas para Funcionários (Estrutura da V2) */}
        <Route element={<FuncionarioRoute />}>
          {/* Usando FilaPedidos sem prop hardcoded (V2) */}
          <Route path="/fila-pedidos" element={<FilaPedidos />} />
          <Route path="/entrega-retirada" element={<EntregaRetirada />} />
          <Route path="/cadastros" element={<Cadastros />} />
        </Route>

        {/* Rota para páginas não encontradas (V2) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;