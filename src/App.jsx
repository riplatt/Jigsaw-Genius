import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SolverPage from './pages/Solver'
import NxNSolverPage from './pages/NxNSolver'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<SolverPage />} />
          <Route path="/solver" element={<SolverPage />} />
          <Route path="/nxn" element={<NxNSolverPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App