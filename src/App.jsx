import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import VotingGateway from './pages/VotingGateway';
import Plataforma from './pages/Plataforma';
import ClientDashboard from './pages/ClientDashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import VotingBooth from './pages/VotingBooth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vote/:electionId" element={<VotingGateway />} />
          <Route path="/booth/:electionId" element={<VotingBooth />} />
          <Route path="/plataforma" element={<Plataforma />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
