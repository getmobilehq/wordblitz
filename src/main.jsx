import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/animations.css';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/lora/400-italic.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/geist-mono/400.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
