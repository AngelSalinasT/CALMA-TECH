import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import CourseDetail from './pages/CourseDetail'
import AssignmentDetail from './pages/AssignmentDetail'

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/logo-full.jpeg"
          alt="CALMA TECH"
          className="h-24 object-contain"
        />
      </div>

      {/* Welcome Message */}
      <div className="text-center max-w-md px-4">
        <h3 className="text-title mb-4">Bienvenido a CALMA TECH</h3>
        <p className="text-gray-text mb-8">
          Sistema de Apoyo y Gestión Educativa con Inteligencia Artificial
        </p>

        <div className="space-y-4">
          <Link to="/login" className="btn-primary w-full block">
            Iniciar Sesión
          </Link>
          <button className="btn-secondary w-full" onClick={() => alert('Funcionalidad de registro en desarrollo.')}>
            Crear Cuenta
          </button>
        </div>

        <p className="text-sm text-gray-text mt-6">
          Versión 1.0.0 - Hackathon 2025
        </p>
      </div>
    </div>
  )
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/alumno" element={<StudentDashboard />} />
        <Route path="/dashboard/profesor" element={<TeacherDashboard />} />
        <Route path="/curso/:courseId" element={<CourseDetail />} />
        <Route path="/curso/:courseId/tarea/:assignmentId" element={<AssignmentDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
