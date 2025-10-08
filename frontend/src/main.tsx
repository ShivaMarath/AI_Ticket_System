import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CheckAuth from './components/CheckAuth'
import Tickets from "./pages/Tickets"
import TicketDetailsPage from './pages/Ticket'
import Login from './pages/Login'
import Singnup from './pages/Singnup'
import Admin from './pages/Admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path='/'
      element={<CheckAuth protectedRoute={true}>
        <Tickets/>
      </CheckAuth>} />

      <Route path='/tickets/:id'
      element={<CheckAuth protectedRoute={true}>
        <TicketDetailsPage/>
      </CheckAuth>} />
 
      <Route path='/login'
      element={<CheckAuth protectedRoute={false}>
        <Login/>
      </CheckAuth>} />

      <Route path='/signup'
      element={<CheckAuth protectedRoute={false}>
        <Singnup/>
      </CheckAuth>} />

      <Route path='/admin'
      element={<CheckAuth protectedRoute={true}>
        <Admin/>
      </CheckAuth>} />
    </Routes>
    </BrowserRouter>
    
  </StrictMode>,
)
