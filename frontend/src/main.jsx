import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CookieConsent from './components/CookieConsent'

function Root() {
  return (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <CookieConsent /> 
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />)
