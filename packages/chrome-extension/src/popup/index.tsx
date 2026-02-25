import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Initialize popup
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

// Create React root
const reactRoot = ReactDOM.createRoot(root);

// Render app
reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Setup global error handler
window.addEventListener('error', (event) => {
  console.error('Popup error:', event.error);
  
  // Send error to background script
  chrome.runtime.sendMessage({
    type: 'ERROR_REPORT',
    data: {
      message: event.error?.message || 'Unknown error',
      stack: event.error?.stack,
      timestamp: Date.now()
    }
  });
});

// Setup unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  chrome.runtime.sendMessage({
    type: 'ERROR_REPORT',
    data: {
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      timestamp: Date.now()
    }
  });
});

// Log initialization
console.log('[Chain Guard] Popup initialized');
