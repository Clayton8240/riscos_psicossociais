import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { SurveyManager } from './pages/SurveyManager';
import { SurveyResponse } from './pages/SurveyResponse';
import { ActionPlans } from './pages/ActionPlans';
import { Login } from './pages/Login';
import { SuperAdmin } from './pages/SuperAdmin';
import { Users } from './pages/Users';
import { Layout } from './components/Layout';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
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
