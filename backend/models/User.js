import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    airtableUserId: {
      type: String,
      required: true,
      unique: true,
    },
    email: String,
    name: String,
    airtableAccessToken: {
      type: String,
      required: true,
    },
    airtableRefreshToken: String,
    tokenExpiresAt: Date,
    loginAt: Date,
  },
  { timestamps: true },
)

export default mongoose.model("User", userSchema)
