import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications styling overlay */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b', // Zinc-900 matching default dark mode
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981', // Emerald success icon
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // Red warning icon
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
