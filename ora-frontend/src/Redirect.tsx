import axios from "axios"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function Redirect() {
  const [searchParams, _setSearchParams] = useSearchParams()
  const code = searchParams.get("code")
  const navigate = useNavigate()

  useEffect(() => {
    if (code) {
      try {
        const item = localStorage.getItem("data")

        if (!item) return

        const data = JSON.parse(item)

        const { verifier } = data

        axios.post("/api/user-token", { code, verifier, redirectUri: "http://localhost:8080/" }).then((data) => {
          localStorage.setItem("access_token", data.data.access_token)
          navigate("/user")
        })
      } catch (error) {
        console.error(error)
      }
    }
  }, [code])

  return (
    <div className="App">
      <button>Login</button>
    </div>
  )
}
