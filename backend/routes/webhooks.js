// Webhook Routes - Sync Airtable changes to MongoDB
import express from "express"
import Response from "../models/Response.js"

const router = express.Router()

router.post("/airtable", async (req, res) => {
  try {
    const { actionMetadata } = req.body

    if (!actionMetadata) {
      return res.status(200).json({ message: "No action metadata" })
    }

    const { sourceId, recordId } = actionMetadata

    const response = await Response.findOne({ airtableRecordId: recordId })

    if (!response) {
      return res.status(200).json({ message: "Response not found" })
    }
    response.updatedAt = new Date()
    await response.save()

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    res.status(200).json({ error: "Webhook processed with error" })
  }
})

export default router
