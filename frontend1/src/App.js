import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// Importando todos os componentes
import Navbar from './components/Navbar';
import Header from './components/Header';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Teams from './components/Teams';
import Footer from './components/Footer'; // Seu Footer
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

// Seus estilos globais
// import './App.css'; (Se você tiver um App.css)
// import './assets/css/styles.css'; (Seu CSS global principal)

// Componente Home (MODIFICADO - Navbar e Footer removidos)
function Home() {
  return (
    <>
      <Navbar />
      <Header />
      <Services />
      <Portfolio />
      <About />
      <Teams />
      <PortfolioModals />
    </>
  );
}

// Componente NotFoundContent (MODIFICADO - Navbar removida)
const NotFoundContent = () => (
  <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
    <h2>Página não encontrada.</h2>
    <p>O endereço que você tentou acessar não existe ou foi removido.</p>
    <p>
      <a href="/">Voltar para a página inicial</a> ou <a href="/login">faça login</a>.
    </p>
  </div>
);

// Layout Principal que inclui Navbar e Footer
// Este componente envolve as páginas que devem ter o layout padrão
const MainLayout = ({ children }) => {
  // paddingTop em 'main' é para evitar que o conteúdo fique atrás de uma Navbar fixa.
  // Ajuste o valor '56px' conforme a altura real da sua Navbar.
  // Se a Navbar não for fixa, você pode remover o paddingTop.
  const mainStyle = {
    flexGrow: 1, // Faz o main ocupar o espaço disponível, empurrando o footer para baixo
    // paddingTop: '70px', // Exemplo se sua Navbar tiver 70px de altura e for fixa
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <main style={mainStyle}>
        {children ? children : <Outlet />} {/* Outlet é para rotas aninhadas como FuncionarioRoute */}
      </main>
      <Footer />
    </div>
  );
};


// Componente App (Mesclado e Atualizado com MainLayout)
function App() {
  return (
    <Router>
      <Routes>
        {/* Rota de Login - SEM MainLayout */}
        <Route path="/login" element={<Login />} />

        {/* Rotas que USAM MainLayout (Navbar e Footer) */}
        <Route element={<MainLayout />}> {/* Layout para rotas aninhadas e diretas */}
          <Route path="/" element={<Home />} />
          <Route path="/profile/edit" element={<ClienteEdit />} />
          <Route path="/carrinho" element={<CarrinhoDeCompras />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/pedidos" element={<MeusPedidos />} />

          {/* Rotas Protegidas para Funcionários, também dentro do MainLayout */}
          {/* FuncionarioRoute agora atua como um wrapper de lógica de autenticação/autorização,
              e o <Outlet /> dentro dele renderizará os componentes de FilaPedidos, etc. */}
          <Route element={<FuncionarioRoute />}>
            <Route path="/fila-pedidos" element={<FilaPedidos />} />
            <Route path="/entrega-retirada" element={<EntregaRetirada />} />
            <Route path="/cadastros" element={<Cadastros />} />
          </Route>

          {/* Rota para páginas não encontradas, também dentro do MainLayout */}
          <Route path="*" element={<NotFoundContent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;