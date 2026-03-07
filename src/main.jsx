import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { ShopProvider } from './context/ShopContext.jsx'
import { registerSW } from 'virtual:pwa-register'
import { seedDefaultSettings } from './db/db.js'

// Register service worker for PWA
registerSW({ immediate: true })

// Seed default settings to Firestore on first run
seedDefaultSettings()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ShopProvider>
      <App />
    </ShopProvider>
  </React.StrictMode>,
)
