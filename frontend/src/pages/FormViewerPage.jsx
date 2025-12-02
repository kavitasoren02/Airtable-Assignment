import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../config/api"
import { getAuthHeader } from "../utils/auth"
import { shouldShowQuestion } from "../utils/conditionalLogic"

function FormViewerPage() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/forms/${formId}`, {
        headers: getAuthHeader(),
      })
      setForm(response.data)
      // Initialize answers object
      const initialAnswers = {}
      response.data.questions.forEach((q) => {
        initialAnswers[q.questionKey] = ""
      })
      setAnswers(initialAnswers)
    } catch (error) {
      setError("Failed to load form")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionKey, value) => {
    setAnswers({ ...answers, [questionKey]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      await axios.post(`${API_BASE_URL}/responses/${formId}/submit`, { answers }, { headers: getAuthHeader() })

      setSuccess(true)
      setAnswers({})
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.error || "Failed to submit form")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!form) return <div className="flex items-center justify-center h-screen">Form not found</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">{form.name}</h1>
        {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}

        {success && <div className="card success">Form submitted successfully! Redirecting...</div>}

        {error && <div className="card error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions.map((question) => {
            const shouldShow = shouldShowQuestion(question.conditionalRules || null, answers)

            if (!shouldShow) return null

            return (
              <div key={question.questionKey} className="card">
                <label className="label">
                  {question.label}
                  {question.required && <span className="text-red-600">*</span>}
                </label>

                {question.type === "singleLineText" && (
                  <input
                    type="text"
                    className="input"
                    value={answers[question.questionKey] || ""}
                    onChange={(e) => handleAnswerChange(question.questionKey, e.target.value)}
                  />
                )}

                {question.type === "multilineText" && (
                  <textarea
                    className="input"
                    rows="4"
                    value={answers[question.questionKey] || ""}
                    onChange={(e) => handleAnswerChange(question.questionKey, e.target.value)}
                  />
                )}

                {question.type === "singleSelect" && (
                  <select
                    className="input"
                    value={answers[question.questionKey] || ""}
                    onChange={(e) => handleAnswerChange(question.questionKey, e.target.value)}
                  >
                    <option value="">Select an option...</option>
                    {question.selectOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === "multipleSelect" && (
                  <div className="space-y-2">
                    {question.selectOptions?.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(answers[question.questionKey] || []).includes(option)}
                          onChange={(e) => {
                            const current = answers[question.questionKey] || []
                            if (e.target.checked) {
                              handleAnswerChange(question.questionKey, [...current, option])
                            } else {
                              handleAnswerChange(
                                question.questionKey,
                                current.filter((v) => v !== option),
                              )
                            }
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "attachment" && (
                  <input
                    type="file"
                    className="input"
                    onChange={(e) => handleAnswerChange(question.questionKey, e.target.files?.[0])}
                  />
                )}
              </div>
            )
          })}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? "Submitting..." : "Submit Form"}
          </button>
        </form>

        <button onClick={() => navigate("/dashboard")} className="btn btn-secondary w-full mt-2">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default FormViewerPage
