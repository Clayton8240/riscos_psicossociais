import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { SurveyManager } from './pages/SurveyManager';
import { SurveyResponse } from './pages/SurveyResponse';
import { ActionPlans } from './pages/ActionPlans';
import { Login } from './pages/Login';
import { SuperAdmin } from './pages/SuperAdmin';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/surveys/manager" element={<SurveyManager />} />
        <Route path="/survey/:id" element={<SurveyResponse />} />
        <Route path="/action-plans" element={<ActionPlans />} />
      </Routes>
    </Router>
  );
}
