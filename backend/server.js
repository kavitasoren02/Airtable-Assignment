// Backend Entry Point
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import authRoutes from "./routes/auth.js"
import formRoutes from "./routes/forms.js"
import responseRoutes from "./routes/responses.js"
import webhookRoutes from "./routes/webhooks.js"
import { authenticate } from "./middleware/auth.js"

dotenv.config()

const app = express()

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database Connection
mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/form-builder")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/forms", authenticate, formRoutes)
app.use("/api/responses", authenticate, responseRoutes)
app.use("/api/webhooks", webhookRoutes)

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err)
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
