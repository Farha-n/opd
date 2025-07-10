import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from 'react-hot-toast';
import '@fontsource/inter/index.css';

createRoot(document.getElementById('root')).render(
  <>
    <Toaster position="top-right" />
    <App />
  </>
);
