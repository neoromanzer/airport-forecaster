import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import VeloraApp from './VeloraApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VeloraApp />
  </StrictMode>,
)
