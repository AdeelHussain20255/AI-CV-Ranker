import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <SignedIn>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </SignedIn>
        
        <SignedOut>
          <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6 text-center">
              AI Candidate Screening
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md text-center">
              Automate your HR workflow with AI-powered CV parsing, scoring, and interview scheduling.
            </p>
            <RedirectToSignIn />
          </div>
        </SignedOut>
      </div>
    </Router>
  )
}

export default App
