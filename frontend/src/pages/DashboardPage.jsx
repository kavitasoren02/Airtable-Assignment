import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../config/api"
import { getAuthHeader } from "../utils/auth"

function DashboardPage() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/forms`, {
        headers: getAuthHeader(),
      })
      setForms(response.data)
    } catch (error) {
      console.error("Error fetching forms:", error)
      setError("Failed to load forms")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Forms</h1>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/forms/create")} className="btn btn-primary mb-6">
          Create New Form
        </button>

        {loading ? (
          <p>Loading forms...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : forms.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-500">No forms yet. Create your first form!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <div key={form._id} className="card">
                <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{form.description || "No description"}</p>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/forms/${form._id}/responses`)} className="btn btn-secondary flex-1">
                    Responses
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/form/${form._id}`;
                      navigator.clipboard.writeText(url);
                      alert("Form link copied!");
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Copy link
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
