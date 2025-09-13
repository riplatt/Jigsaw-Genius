import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SolverPage from './pages/Solver'
import NxNSolverPage from './pages/NxNSolver'
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SolverPage />} />
            <Route path="/solver" element={<SolverPage />} />
            <Route path="/nxn" element={<NxNSolverPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App