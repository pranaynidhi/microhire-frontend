import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const theme = {
  token: {
    colorPrimary: '#DC143C',
    colorSuccess: '#059669',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#1E3A8A',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme}>
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)