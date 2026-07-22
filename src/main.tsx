import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="text-slate-800 bg-slate-50 min-h-screen font-sans">
        <App />
      </div>
    </BrowserRouter>
  </StrictMode>,
)
