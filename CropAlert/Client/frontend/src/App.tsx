import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import NewDashboard from './pages/NewDashboard';
import CreateAlert from './pages/CreateAlert';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <NewDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-alert" 
                element={
                  <ProtectedRoute roles={['agronomist']}>
                    <CreateAlert />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'bg-white shadow-lg border border-gray-200',
                duration: 4000,
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;