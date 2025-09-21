import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { EquipmentList } from './components/EquipmentList'
import { EquipmentForm } from './components/EquipmentForm'
import { ObsolescenceView } from './components/ObsolescenceView'
import { UserManagement } from './components/UserManagement'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Simulation d'un utilisateur connecté
    setCurrentUser({
      id: 1,
      username: 'admin',
      role: 'administrator'
    })
  }, [])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Gestionnaire d'Obsolescence IT
          </h1>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          currentUser={currentUser}
        />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipment" element={<EquipmentList />} />
              <Route path="/equipment/new" element={<EquipmentForm />} />
              <Route path="/equipment/edit/:id" element={<EquipmentForm />} />
              <Route path="/obsolescence" element={<ObsolescenceView />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

