import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { SurveyManager } from './pages/SurveyManager';
import { SurveyResponse } from './pages/SurveyResponse';
import { ActionPlans } from './pages/ActionPlans';
import { Login } from './pages/Login';
import { SuperAdmin } from './pages/SuperAdmin';
import { ConsultantPanel } from './pages/ConsultantPanel';
import { Users } from './pages/Users';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Plans } from './pages/Plans';
import { Payment } from './pages/Payment';
import { ConsultantLanding } from './pages/ConsultantLanding';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/consultores" element={<ConsultantLanding />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
        
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/consultant" element={<ConsultantPanel />} />
        <Route path="/survey/:id" element={<SurveyResponse />} />

        {/* Authenticated Routes wrapped in Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/dashboard/:id" element={<Layout><Dashboard /></Layout>} />
        <Route path="/surveys/manager" element={<Layout><SurveyManager /></Layout>} />
        <Route path="/action-plans" element={<Layout><ActionPlans /></Layout>} />
        <Route path="/users" element={<Layout><Users /></Layout>} />
      </Routes>
    </Router>
  );
}
