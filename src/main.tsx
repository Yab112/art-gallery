import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Scroll to top on initial page load/refresh (before React renders)
window.scrollTo({
  top: 0,
  left: 0,
  behavior: "instant",
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
