import { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { User } from '../types';
import { UserRole } from '../types';
import SuperAdminLogin from '../components/SuperAdminLogin/SuperAdminLogin';
import Sidebar from '../components/Sidebar/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { authService } from '../services/authService';

// Lazy load components for better code splitting
const SuperAdminDashboard = lazy(() => import('../components/SuperAdminDashboard/SuperAdminDashboard'));
const AddCompanyPage = lazy(() => import('../components/AddCompanyPage/AddCompanyPage'));
const Companies = lazy(() => import('../components/Companies/Companies'));
import CompanyDetails from '../components/CompanyDetails/CompanyDetails';
import EditCompanyPage from '../components/EditCompanyPage/EditCompanyPage';
const Users = lazy(() => import('../components/Users/Users'));
const Settings = lazy(() => import('../components/Settings/Settings'));
const SuperAdmins = lazy(() => import('../components/SuperAdmins/SuperAdmins'));
const EditSuperAdmin = lazy(() => import('../components/EditSuperAdmin/EditSuperAdmin'));
import TestDecrypt from '../components/TestDecrypt/TestDecrypt';
import './App.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = authService.getCurrentUser();
    return user && user.role === UserRole.SUPER_ADMIN ? user : null;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const user = await authService.login(email, password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`app ${theme}`}>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <SuperAdminLogin onLogin={handleLogin} />} />
          <Route path="/:encryptedId/login" element={<TestDecrypt />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute currentUser={currentUser} allowedRoles={[UserRole.SUPER_ADMIN]}>
                <DashboardLayout
                  currentUser={currentUser!}
                  onLogout={handleLogout}
                  sidebarCollapsed={sidebarCollapsed}
                  onToggleSidebar={toggleSidebar}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard currentUser={currentUser!} theme={theme} />} />
            <Route path="companies/:id" element={<CompanyDetails theme={theme} />} />
            <Route path="companies" element={<Companies theme={theme} />} />
            <Route path="companies/add" element={<AddCompanyPage />} />
            <Route path="companies/:id/edit" element={<EditCompanyPage theme={theme} />} />
            <Route path="users" element={<Users theme={theme} />} />
            <Route path="superadmins" element={<SuperAdmins theme={theme} />} />
            <Route path="superadmins/:id/edit" element={<EditSuperAdmin theme={theme} />} />
            <Route path="settings" element={<Settings currentUser={currentUser!} onUpdateUser={() => {}} theme={theme} />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

const DashboardLayout = ({
  currentUser,
  onLogout,
  sidebarCollapsed,
  onToggleSidebar,
  theme,
  onToggleTheme
}: {
  currentUser: User;
  onLogout: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) => {
  // console.log('DashboardLayout rendering');
  return (
    <div className="dashboard-layout">
      <Sidebar
        currentUser={currentUser}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default App;