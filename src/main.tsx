import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import "./styles/index.css";

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error('Root element not found');
}
