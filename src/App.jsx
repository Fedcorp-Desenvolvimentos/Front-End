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
import HistoricoPage from './components/Dropdown/dropItens/HistoricoPage';

import HomeAdm from './components/Adm/ImportacaoAdmPage';
import Upload from './components/Adm/Upload';
import ImportVida from './components/Adm/ImportVida';
import ImportAlug from './components/Adm/ImportAlug';


import DashboardLayout from './Layouts/DashboardLayout';
import PrivateRoute from './services/privateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />

          {/* Rotas privadas com layout padrão */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/consulta-pf" element={<ConsultaPF />} />
              <Route path="/consulta-end" element={<ConsultaEnd />} />
              <Route path="/consulta-cnpj" element={<ConsultaCNPJ />} />
              <Route path="/consulta-comercial" element={<Comercial />} />
              <Route path="/consulta-segurados" element={<Segurados />} />
              <Route path="/conta" element={<Conta />} />
              <Route path="/config" element={<Config />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/historico" element={<HistoricoPage />} />
              <Route path="/home-adm" element={<HomeAdm />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/importacao-vida" element={<ImportVida />} />
              <Route path="/importacao-alug" element={<ImportAlug />} />

            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
