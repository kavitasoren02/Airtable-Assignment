import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../config/api"
import { getAuthHeader } from "../utils/auth"

function ResponsesPage() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const [responses, setResponses] = useState([])
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchForm(), fetchResponses()])
  }, [formId])

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/forms/${formId}`, {
        headers: getAuthHeader(),
      })
      setForm(response.data)
    } catch (error) {
      console.error("Error fetching form:", error)
    }
  }

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/responses/${formId}`, {
        headers: getAuthHeader(),
      })
      setResponses(response.data)
    } catch (error) {
      console.error("Error fetching responses:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{form?.name} - Responses</h1>
          <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p>Loading responses...</p>
        ) : responses.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-500">No responses yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Submitted At</th>
                  <th className="px-6 py-3 text-left font-semibold">Answers</th>
                  <th className="px-6 py-3 text-left font-semibold">Airtable ID</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response, idx) => (
                  <tr key={response._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3 text-sm">{formatDate(response.submittedAt)}</td>
                    <td className="px-6 py-3 text-sm">
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                        {JSON.stringify(response.answers, null, 2)}
                      </pre>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{response.airtableRecordId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponsesPage
