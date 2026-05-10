import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import './index.css'
import './i18n'

// Init before render so boot crashes are captured.
initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<div>Er is iets misgegaan. Het team is geïnformeerd.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </BrowserRouter>
      </Suspense>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
