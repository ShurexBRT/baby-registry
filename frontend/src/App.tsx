import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './routes/Home'
import InstallPrompt from './components/InstallPrompt'
import { Link } from 'react-router-dom'

const qc = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-dvh">
        <div className="max-w-3xl mx-auto p-4">
          <header className="py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Strajina Shoping Lista</h1>
            
          </header>
          <Home />
        </div>
        <InstallPrompt />
      </div>
    </QueryClientProvider>
  )
}