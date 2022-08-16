import axios from "axios"

export default function Home() {
  async function handleClick() {
    try {
      const { data } = await axios.get("/api/url")
      const url = data.url
      localStorage.setItem("data", JSON.stringify(data))
      window.location.href = url
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="App">
      <button onClick={handleClick}>Login</button>
    </div>
  )
}
