import React, { useState } from 'react';
import { Search, PlusCircle, ShieldAlert, Compass, FileSearch, Lock, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activePage, setActivePage }) {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-logo" onClick={() => handleNavClick('landing')}>
          <div className="brand-icon">
            <Compass size={20} />
          </div>
          <span>Lost & Found Hub</span>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <button
            className={`nav-link-btn ${activePage === 'landing' ? 'active' : ''}`}
            onClick={() => handleNavClick('landing')}
          >
            Home
          </button>

          <button
            className={`nav-link-btn ${activePage === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            <Search size={16} />
            Search Items
          </button>

          <button
            className={`nav-link-btn ${activePage === 'report-lost' ? 'active' : ''}`}
            onClick={() => handleNavClick('report-lost')}
          >
            <ShieldAlert size={16} color="var(--color-lost)" />
            Report Lost
          </button>

          <button
            className={`nav-link-btn ${activePage === 'report-found' ? 'active' : ''}`}
            onClick={() => handleNavClick('report-found')}
          >
            <PlusCircle size={16} color="var(--color-found)" />
            Report Found
          </button>

          <button
            className={`nav-link-btn ${activePage === 'track-claim' ? 'active' : ''}`}
            onClick={() => handleNavClick('track-claim')}
          >
            <FileSearch size={16} />
            Track Claim
          </button>

          <button
            className={`nav-link-btn ${activePage === 'admin' ? 'active' : ''}`}
            onClick={() => handleNavClick('admin')}
          >
            <Lock size={16} />
            Admin Portal
            {isAdmin && <span className="nav-admin-badge">Admin</span>}
          </button>

          {user && (
            <button
              className="nav-link-btn"
              onClick={logout}
              title="Logout"
              style={{ color: 'var(--color-danger)' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
