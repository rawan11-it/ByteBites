import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle development websocket disconnects gracefully without causing fatal unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || (typeof reason === 'string' ? reason : '');
    if (message.includes('WebSocket') || message.includes('WebSocket closed without opened')) {
      event.preventDefault();
      console.warn('[Vite HMR] Development WebSocket notice:', message || 'Connection closed');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
