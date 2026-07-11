import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TeamBuilder from './pages/TeamBuilder'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="team-builder" element={<TeamBuilder />} />
      </Route>
    </Routes>
  )
}

export default App
