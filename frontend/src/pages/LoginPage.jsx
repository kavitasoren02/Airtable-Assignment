import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../config/api"

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate()

  const handleLoginWithAirtable = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/oauth-url`)
      window.location.href = response.data.url
    } catch (error) {
      alert("Failed to get login URL")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Form Builder</h1>
        <p className="text-gray-600 text-center mb-6">Create dynamic forms connected to Airtable</p>

        <button onClick={handleLoginWithAirtable} className="btn btn-primary w-full">
          Login with Airtable
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">Your forms are securely synced with Airtable</p>
      </div>
    </div>
  )
}

export default LoginPage
