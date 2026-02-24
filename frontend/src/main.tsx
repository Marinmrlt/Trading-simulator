import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        }
      }} />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
