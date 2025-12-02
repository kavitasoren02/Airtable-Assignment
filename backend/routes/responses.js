// Response Routes - Save responses to Airtable and DB
import express from "express"
import axios from "axios"
import Response from "../models/Response.js"
import Form from "../models/Form.js"
import User from "../models/User.js"
import { shouldShowQuestion } from "../utils/conditionalLogic.js"

const router = express.Router()

const validateResponse = (answers, questions) => {
  for (const question of questions) {
    if (question.required && (!answers[question.questionKey] || answers[question.questionKey] === "")) {
      return { valid: false, error: `${question.label} is required` }
    }

    if (answers[question.questionKey]) {
      if (question.type === "singleSelect") {
        if (!question.selectOptions?.includes(answers[question.questionKey])) {
          return { valid: false, error: `Invalid value for ${question.label}` }
        }
      }

      if (question.type === "multipleSelect") {
        const values = answers[question.questionKey]
        if (!Array.isArray(values)) {
          return { valid: false, error: `${question.label} must be an array` }
        }
        for (const val of values) {
          if (!question.selectOptions?.includes(val)) {
            return { valid: false, error: `Invalid value for ${question.label}` }
          }
        }
      }
    }
  }
  return { valid: true }
}

const mapAnswersToAirtable = (answers, questions) => {
  const airtableRecord = {}

  for (const question of questions) {
    if (answers[question.questionKey] !== undefined) {
      airtableRecord[question.fieldId] = answers[question.questionKey]
    }
  }

  return airtableRecord
}

router.post("/:formId/submit", async (req, res) => {
  try {
    const { formId } = req.params
    const { answers } = req.body

    const form = await Form.findById(formId)
    if (!form) {
      return res.status(404).json({ error: "Form not found" })
    }

    const visibleQuestions = form.questions.filter((q) => shouldShowQuestion(q.conditionalRules || null, answers))

    const validation = validateResponse(answers, visibleQuestions)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const user = await User.findById(form.ownerId)
    if (!user) {
      return res.status(404).json({ error: "Form owner not found" })
    }

    const airtableFields = mapAnswersToAirtable(answers, form.questions)

    let airtableRecordId
    try {
      const airtableResponse = await axios.post(
        `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableId}`,
        {
          records: [{ fields: airtableFields }],
        },
        {
          headers: {
            Authorization: `Bearer ${user.airtableAccessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      airtableRecordId = airtableResponse.data.records[0].id
    } catch (error) {
      console.error("Error saving to Airtable:", error.response?.data || error.message)
      return res.status(500).json({ error: "Failed to save to Airtable" })
    }

    const response = new Response({
      formId,
      airtableRecordId,
      answers,
      submittedAt: new Date(),
    })

    await response.save()

    res.status(201).json({
      message: "Response saved successfully",
      responseId: response._id,
      airtableRecordId,
    })
  } catch (error) {
    console.error("Error submitting response:", error)
    res.status(500).json({ error: "Failed to submit response" })
  }
})

router.get("/:formId", async (req, res) => {
  try {
    const { formId } = req.params

    const responses = await Response.find({ formId, deletedInAirtable: false }).sort({ createdAt: -1 })

    res.json(responses)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch responses" })
  }
})

export default router
