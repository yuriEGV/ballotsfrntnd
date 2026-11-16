import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

const VotingGateway = lazy(() => import('./pages/VotingGateway'));
const VotingBooth = lazy(() => import('./pages/VotingBooth'));
const Plataforma = lazy(() => import('./pages/Plataforma'));
const PlazaCiudadana = lazy(() => import('./pages/PlazaCiudadana'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="w-9 h-9 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
      <span className="text-xs font-bold tracking-wider uppercase">Cargando...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/vote/:electionId" element={<VotingGateway />} />
            <Route path="/booth/:electionId" element={<VotingBooth />} />
            <Route path="/plataforma" element={<Plataforma />} />
            <Route path="/plaza" element={<PlazaCiudadana />} />
            <Route path="/encuestas" element={<PlazaCiudadana />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
