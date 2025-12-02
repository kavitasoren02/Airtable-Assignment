import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import FormBuilderPage from "./pages/FormBuilderPage"
import FormViewerPage from "./pages/FormViewerPage"
import ResponsesPage from "./pages/ResponsesPage"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import { getToken } from "./utils/auth"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has token
    const token = getToken()
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/auth/callback" element={<AuthCallbackPage onLoginSuccess={() => setIsAuthenticated(true)} />} />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/forms/create" element={<FormBuilderPage />} />
            <Route path="/forms/:formId/edit" element={<FormBuilderPage />} />
            <Route path="/form/:formId" element={<FormViewerPage />} />
            <Route path="/forms/:formId/responses" element={<ResponsesPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  )
}

export default App
