import express from "express"
import axios from "axios"
import Form from "../models/Form.js"
import User from "../models/User.js"

const router = express.Router()

const SUPPORTED_TYPES = {
  singleLineText: "singleLineText",
  multilineText: "multilineText",
  singleSelect: "singleSelect",
  multipleSelect: "multipleSelect",
  multipleAttachments: "attachment",
}

router.get("/airtable/bases", async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const response = await axios.get("https://api.airtable.com/v0/meta/bases", {
      headers: {
        Authorization: `Bearer ${user.airtableAccessToken}`,
      },
    })

    res.json(response.data.bases)
  } catch (error) {
    console.error("Error fetching bases:", error.response?.data || error.message)
    res.status(500).json({ error: "Failed to fetch bases" })
  }
})

router.get("/airtable/bases/:baseId/tables", async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const { baseId } = req.params

    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${user.airtableAccessToken}`,
      },
    })

    res.json(response.data.tables)
  } catch (error) {
    console.error("Error fetching tables:", error.response?.data || error.message)
    res.status(500).json({ error: "Failed to fetch tables" })
  }
})

router.get("/airtable/bases/:baseId/tables/:tableId/fields", async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const { baseId, tableId } = req.params

    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${user.airtableAccessToken}`,
      },
    })

    const table = response.data.tables.find((t) => t.id === tableId)
    if (!table) {
      return res.status(404).json({ error: "Table not found" })
    }

    const supportedFields = table.fields.filter((field) => Object.keys(SUPPORTED_TYPES).includes(field.type))

    res.json(supportedFields)
  } catch (error) {
    console.error("Error fetching fields:", error)
    res.status(500).json({ error: "Failed to fetch fields" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { name, description, baseId, tableId, questions } = req.body

    for (const question of questions) {
      if (!Object.keys(SUPPORTED_TYPES).includes(question.type)) {
        return res.status(400).json({
          error: `Unsupported field type: ${question.type}`,
        })
      }
    }

    const form = new Form({
      ownerId: req.userId,
      name,
      description,
      airtableBaseId: baseId,
      airtableTableId: tableId,
      questions,
    })

    await form.save()
    res.status(201).json(form)
  } catch (error) {
    console.error("Error creating form:", error)
    res.status(500).json({ error: "Failed to create form" })
  }
})

router.get("/", async (req, res) => {
  try {
    const forms = await Form.find({ ownerId: req.userId })
    res.json(forms)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch forms" })
  }
})

router.get("/:formId", async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId)
    if (!form) {
      return res.status(404).json({ error: "Form not found" })
    }
    res.json(form)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch form" })
  }
})

export default router
