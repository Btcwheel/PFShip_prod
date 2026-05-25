import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Anagrafiche from './pages/Anagrafiche'
import Fatture from './pages/Fatture'
import Agenti from './pages/Agenti'
import Tracking from './pages/Tracking'
import Tickets from './pages/Tickets'
import Layout from './components/Layout'

function RequireAuth({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="anagrafiche" element={<Anagrafiche />} />
          <Route path="fatture" element={<Fatture />} />
          <Route path="agenti" element={<Agenti />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="tickets" element={<Tickets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
