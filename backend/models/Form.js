import mongoose from "mongoose"

const conditionSchema = new mongoose.Schema(
  {
    questionKey: String,
    operator: {
      type: String,
      enum: ["equals", "notEquals", "contains"],
    },
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
)

const conditionalRulesSchema = new mongoose.Schema(
  {
    logic: {
      type: String,
      enum: ["AND", "OR"],
      default: "AND",
    },
    conditions: [conditionSchema],
  },
  { _id: false },
)

const questionSchema = new mongoose.Schema(
  {
    questionKey: String,
    fieldId: String,
    label: String,
    type: {
      type: String,
      enum: ["singleLineText", "multilineText", "singleSelect", "multipleSelect", "attachment"],
    },
    required: Boolean,
    conditionalRules: conditionalRulesSchema,
  },
  { _id: false },
)

const formSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    airtableBaseId: {
      type: String,
      required: true,
    },
    airtableTableId: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Form", formSchema)
