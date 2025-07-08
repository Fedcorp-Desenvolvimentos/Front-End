import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import EsqueciSenha from './components/Login/EsqueciSenha/EsqueciSenha';
import Home from './components/Home/Home';
import ConsultaPF from './components/Consultas/ConsultaPF';
import ConsultaEnd from './components/Consultas/ConsultaEnd';
import ConsultaCNPJ from './components/Consultas/ConsultaCNPJ';
import Comercial from './components/Consultas/Comercial';
import Segurados from './components/Consultas/Segurados';
import Conta from './components/Dropdown/dropItens/conta';
import Config from './components/Dropdown/dropItens/Configuracoes';
import Cadastro from './components/Dropdown/dropItens/Cadastro';
import DashboardLayout from './Layouts/DashboardLayout';
import HistoricoPage from "./components/Dropdown/dropItens/HistoricoPage"; 
import PrivateRoute from './services/privateRoute';
function App() {
  return (
    <Router>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />

        {/* Páginas protegidas com layout */}
        <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}> 
          <Route path="/home" element={<Home />} />
          <Route path="/consulta-pf" element={<ConsultaPF />} />
          <Route path="/consulta-end" element={<ConsultaEnd />} />
          <Route path="/consulta-cnpj" element={<ConsultaCNPJ />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="/config" element={<Config />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/historico" element={<HistoricoPage />} />
          <Route path="/consulta-comercial" element={<Comercial />} />
          <Route path="/consulta-segurados" element={<Segurados />} />
        </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
