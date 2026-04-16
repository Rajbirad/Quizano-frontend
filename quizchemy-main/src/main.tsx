
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

const container = document.getElementById('root')

if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <App />
      <Toaster />
      <SonnerToaster richColors position="top-right" />
    </React.StrictMode>
  )
} else {
  console.error('Root element not found!')
}
