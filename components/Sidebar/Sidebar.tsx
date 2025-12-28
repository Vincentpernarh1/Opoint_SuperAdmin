import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../../types';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  LogOutIcon,
  ShieldCheckIcon,
  XMarkIcon,
  Bars3Icon
} from '../Icons/Icons';
import './Sidebar.scss';

interface SidebarProps {
  currentUser: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

const Sidebar = ({ currentUser, isCollapsed, onToggleCollapse, theme, onToggleTheme, onLogout }: SidebarProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/dashboard/companies', label: 'Companies', icon: BuildingOfficeIcon },
    { path: '/dashboard/users', label: 'Users', icon: UsersIcon },
    { path: '/dashboard/superadmins', label: 'Super Admins', icon: ShieldCheckIcon },
    { path: '/dashboard/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button onClick={toggleMobileMenu} className="mobile-menu-btn" aria-label="Toggle menu">
          {mobileMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
        </button>
        <span className="mobile-logo">VPENA OPOINT</span>
        <div className="mobile-actions">
          <button onClick={onToggleTheme} className="theme-toggle-mobile" aria-label="Toggle theme">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''} ${theme}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          {!isCollapsed && <span className="logo-text">VPENA OPOINT</span>}
          <button onClick={onToggleCollapse} className="collapse-btn hidden-mobile">
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
              onClick={closeMobileMenu}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onToggleTheme} className="theme-toggle hidden-mobile" title={isCollapsed ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : ''}>
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          {!isCollapsed && <span>Theme</span>}
        </button>

        {(!isCollapsed || mobileMenuOpen) && (
          <div className="user-info">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="user-avatar" />
            ) : (
              <UserCircleIcon className="user-avatar-icon" />
            )}
            <div className="user-details">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{currentUser.role}</span>
            </div>
          </div>
        )}

        <button onClick={() => { onLogout(); closeMobileMenu(); }} className="logout-btn" title={isCollapsed ? 'Logout' : ''}>
          <LogOutIcon />
          {(!isCollapsed || mobileMenuOpen) && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;