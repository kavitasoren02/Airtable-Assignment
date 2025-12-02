import mongoose from "mongoose"

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    airtableRecordId: String,
    answers: mongoose.Schema.Types.Mixed,
    submittedAt: Date,
    deletedInAirtable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Response", responseSchema)
