import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login.jsx';
import EsqueciSenha from './components/Login/EsqueciSenha/EsqueciSenha';
import Home from './components/Home/Home';
import ConsultaPF from './components/Consultas/ConsultaPF';
import ConsultaEnd from './components/Consultas/ConsultaEnd';
import ConsultaCNPJ from './components/Consultas/ConsultaCNPJ';
import Conta from './components/Dropdown/dropItens/conta.jsx';
import Config from './components/Dropdown/dropItens/Configuracoes.jsx';
import Cadastro from './components/Dropdown/dropItens/Cadastro.jsx';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/home" element={<Home />} />
          <Route path="/consulta-pf" element={<ConsultaPF />} />
          <Route path="/consulta-end" element={<ConsultaEnd />} />
          <Route path="/consulta-cnpj" element={<ConsultaCNPJ />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="/config" element={<Config />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Routes>
      </Router>
  );
}

export default App; 