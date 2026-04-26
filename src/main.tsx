import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AuthGate } from './components/AuthGate.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
