import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../config/api"
import { setToken } from "../utils/auth"

function AuthCallbackPage({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state");
        if (!code || !state) {
          throw new Error("No authorization code")
        }

        const response = await axios.post(`${API_BASE_URL}/auth/callback`, {
          code,
          state
        })

        setToken(response.data.token)
        onLoginSuccess()
        navigate("/dashboard")
      } catch (error) {
        console.error("Auth error:", error)
        navigate("/login")
      }
    }

    exchangeCodeForToken()
  }, [searchParams, navigate, onLoginSuccess])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging you in...</p>
    </div>
  )
}

export default AuthCallbackPage
