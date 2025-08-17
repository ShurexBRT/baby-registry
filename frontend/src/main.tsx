import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App'
import Admin from './routes/Admin'
import Login from './routes/Login'          // 👈 dodato           
import Account from './routes/Account'        // 👈 dodato
import ResetPassword from './routes/ResetPassword' // 👈 dodato
import Signup from './routes/Signup'          // 👈 ako imaš / opciono

import './styles/index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

const qc = new QueryClient()

function Root() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} /> {/* po želji */}
          <Route
            path="*"
            element={
              <div className="p-6">
                404 • <Link className="underline" to="/">Nazad</Link>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
