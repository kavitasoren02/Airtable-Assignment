import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../config/api"
import { getAuthHeader } from "../utils/auth"

function FormBuilderPage() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const isEditing = !!formId

  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [bases, setBases] = useState([])
  const [selectedBaseId, setSelectedBaseId] = useState("")
  const [tables, setTables] = useState([])
  const [selectedTableId, setSelectedTableId] = useState("")
  const [fields, setFields] = useState([])
  const [selectedFields, setSelectedFields] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch bases on mount
  useEffect(() => {
    fetchBases()
  }, [])

  // Fetch tables when base changes
  useEffect(() => {
    if (selectedBaseId) {
      fetchTables()
    }
  }, [selectedBaseId])

  // Fetch fields when table changes
  useEffect(() => {
    if (selectedTableId) {
      fetchFields()
    }
  }, [selectedTableId])

  const fetchBases = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/forms/airtable/bases`, {
        headers: getAuthHeader(),
      })
      setBases(response.data)
    } catch (error) {
      setError("Failed to load Airtable bases")
    }
  }

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/forms/airtable/bases/${selectedBaseId}/tables`, {
        headers: getAuthHeader(),
      })
      setTables(response.data)
      setFields([])
      setSelectedFields([])
    } catch (error) {
      setError("Failed to load tables")
    }
  }

  const fetchFields = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/forms/airtable/bases/${selectedBaseId}/tables/${selectedTableId}/fields`,
        { headers: getAuthHeader() },
      )
      setFields(response.data)
    } catch (error) {
      setError("Failed to load fields")
    }
  }

  const handleFieldToggle = (field) => {
    const isSelected = selectedFields.some((f) => f.id === field.id)

    if (isSelected) {
      setSelectedFields(selectedFields.filter((f) => f.id !== field.id))
      setQuestions(questions.filter((q) => q.fieldId !== field.id))
    } else {
      setSelectedFields([...selectedFields, field])
      setQuestions([
        ...questions,
        {
          questionKey: `q_${field.id}`,
          fieldId: field.id,
          label: field.name,
          type: field.type,
          required: false,
          conditionalRules: null,
        },
      ])
    }
  }

  const updateQuestion = (fieldId, updates) => {
    setQuestions(questions.map((q) => (q.fieldId === fieldId ? { ...q, ...updates } : q)))
  }

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      setError("Form name is required")
      return
    }

    if (questions.length === 0) {
      setError("Please select at least one field")
      return
    }

    try {
      setLoading(true)
      await axios.post(
        `${API_BASE_URL}/forms`,
        {
          name: formName,
          description: formDescription,
          baseId: selectedBaseId,
          tableId: selectedTableId,
          questions,
        },
        { headers: getAuthHeader() },
      )
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save form")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit" : "Create"} Form</h1>

        {error && <div className="card error">{error}</div>}

        <div className="card">
          <div className="form-group">
            <label className="label">Form Name *</label>
            <input
              type="text"
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name"
            />
          </div>

          <div className="form-group">
            <label className="label">Form Description</label>
            <textarea
              className="input"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Enter form description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="label">Select Airtable Base *</label>
            <select className="input" value={selectedBaseId} onChange={(e) => setSelectedBaseId(e.target.value)}>
              <option value="">Choose a base...</option>
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBaseId && (
            <div className="form-group">
              <label className="label">Select Table *</label>
              <select className="input" value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)}>
                <option value="">Choose a table...</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {fields.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4">Select Fields</h2>
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                  <input
                    type="checkbox"
                    id={field.id}
                    checked={selectedFields.some((f) => f.id === field.id)}
                    onChange={() => handleFieldToggle(field)}
                  />
                  <label htmlFor={field.id} className="flex-1 cursor-pointer">
                    <span className="font-medium">{field.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({field.type})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4">Configure Questions</h2>
            <div className="space-y-4">
              {questions.map((question, idx) => (
                <div key={question.fieldId} className="border border-gray-200 rounded p-4">
                  <div className="form-group">
                    <label className="label">Question Label</label>
                    <input
                      type="text"
                      className="input"
                      value={question.label}
                      onChange={(e) => updateQuestion(question.fieldId, { label: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.fieldId, { required: e.target.checked })}
                      />
                      <span className="ml-2">Required</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button onClick={handleSaveForm} disabled={loading} className="btn btn-primary">
            {loading ? "Saving..." : "Save Form"}
          </button>
          <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormBuilderPage
