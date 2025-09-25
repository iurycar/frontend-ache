import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpreadsheetProvider } from './contexts/SpreadsheetContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PackagingAnalysis from './pages/PackagingAnalysis';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Configuration from './pages/Configuration';
import ChatbotProvider from './contexts/ChatbotContext';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <NotificationProvider>
          <AuthProvider>
            <SpreadsheetProvider>
              <ChatbotProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analise-embalagens"
                      element={
                        <ProtectedRoute>
                          <PackagingAnalysis />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/calendario"
                      element={
                        <ProtectedRoute>
                          <Calendar />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/relatorios"
                      element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/equipe"
                      element={
                        <ProtectedRoute>
                          <Team />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/configuracoes"
                      element={
                        <ProtectedRoute>
                          <Configuration />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                  <ChatbotWidget />
                </Router>
              </ChatbotProvider>
            </SpreadsheetProvider>
          </AuthProvider>
        </NotificationProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;