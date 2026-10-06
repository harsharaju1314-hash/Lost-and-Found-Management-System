import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SearchItemsPage } from './pages/SearchItemsPage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { TrackClaimPage } from './pages/TrackClaimPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleSelectItem = (id) => {
    setSelectedItemId(id);
    setActivePage('item-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="app-container">
          <Navbar activePage={activePage} setActivePage={handleNavigate} />

          <main className="main-content">
            {activePage === 'landing' && (
              <LandingPage onNavigate={handleNavigate} onSelectItem={handleSelectItem} />
            )}

            {activePage === 'search' && (
              <SearchItemsPage onSelectItem={handleSelectItem} onNavigate={handleNavigate} />
            )}

            {activePage === 'report-lost' && (
              <ReportItemPage defaultType="lost" onSelectItem={handleSelectItem} onNavigate={handleNavigate} />
            )}

            {activePage === 'report-found' && (
              <ReportItemPage defaultType="found" onSelectItem={handleSelectItem} onNavigate={handleNavigate} />
            )}

            {activePage === 'track-claim' && (
              <TrackClaimPage onSelectItem={handleSelectItem} />
            )}

            {activePage === 'item-detail' && (
              <ItemDetailPage
                itemId={selectedItemId}
                onBack={() => handleNavigate('search')}
                onSelectItem={handleSelectItem}
              />
            )}

            {activePage === 'admin' && (
              <AdminDashboardPage onSelectItem={handleSelectItem} />
            )}
          </main>

          <Footer onNavigate={handleNavigate} />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
