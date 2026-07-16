import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TeamBuilder from './pages/TeamBuilder'
import Legal from './pages/Legal'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="team-builder" element={<TeamBuilder />} />
        <Route path="legal" element={<Legal />} />
      </Route>
    </Routes>
  )
}

export default App
