import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'  // <-- PAKAI HashRouter!
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>  {/* <-- HashRouter */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)