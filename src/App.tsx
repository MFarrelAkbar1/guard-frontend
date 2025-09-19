import React from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FullPageLoading } from './components/common/Loading';

function AppContent() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <FullPageLoading text="Loading..." />;
  }

  return (
    <div className="App">
      {user ? (
        <DashboardPage onLogout={signOut} />
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;