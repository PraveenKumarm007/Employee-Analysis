import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeReport from './pages/EmployeeReport';
import KPIs from './pages/KPIs';
import Projects from './pages/Projects';
import Attendance from './pages/Attendance';
import Training from './pages/Training';
import Appraisals from './pages/Appraisals';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import MyProfile from './pages/MyProfile';
import MyPerformance from './pages/MyPerformance';

const HomeRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'Admin') return <Dashboard />;
  return <MyProfile />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<HomeRoute />} />
              <Route path="employees" element={<ProtectedRoute allowedRoles={['Admin']}><Employees /></ProtectedRoute>} />
              <Route path="employees/:id" element={<ProtectedRoute allowedRoles={['Admin']}><EmployeeReport /></ProtectedRoute>} />
              <Route path="kpis" element={<ProtectedRoute allowedRoles={['Admin']}><KPIs /></ProtectedRoute>} />
              <Route path="projects" element={<ProtectedRoute allowedRoles={['Admin']}><Projects /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute allowedRoles={['Admin']}><Attendance /></ProtectedRoute>} />
              <Route path="training" element={<ProtectedRoute allowedRoles={['Admin']}><Training /></ProtectedRoute>} />
              <Route path="appraisals" element={<ProtectedRoute allowedRoles={['Admin']}><Appraisals /></ProtectedRoute>} />
              <Route path="my-performance" element={<ProtectedRoute allowedRoles={['Employee']}><MyPerformance /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
