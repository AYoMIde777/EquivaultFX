import faviconUrl from './assets/favicon.png';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/global.css';
import './styles/public.css';
import './styles/dashboard.css';

// Set the dynamic favicon
const favicon =
  document.getElementById('dynamic-favicon') ||
  document.querySelector('link[rel="icon"]') ||
  document.createElement('link');

favicon.id = 'dynamic-favicon';
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = `${faviconUrl}?v=2`;

if (!favicon.parentNode) {
  document.head.appendChild(favicon);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);