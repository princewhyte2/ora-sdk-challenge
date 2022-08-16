const express = require("express")
const app = express()
const OraBox = require("ora-sdk")
const client = require("../client.json")
const cors = require("cors")
const path = require("path")
const port = 8080

const oraBox = new OraBox({
  clientId: client.id,
  scopes: client.allowedScopes,
  pemCert: "../certificate.pem",
})

const REDIRECT_BASE = "http://localhost:8080"

app.use(cors())
app.use(express.json())

app.use(express.static("dist"))

app.get("/api/url", async (_req, res) => {
  try {
    const { verifier, challenge } = await oraBox.generateVerifierChallengePair()
    const url = await oraBox.buildAuthorizationUrl(challenge, `${REDIRECT_BASE}/return`)
    res.json({ url, verifier, challenge })
  } catch (error) {
    res.status(403).json({ message: "something went wrong" })
    console.log(error)
  }
})

app.post("/api/user-token", async (req, res) => {
  try {
    const { code, verifier } = req.body
    const clientAssertion = oraBox.generatePrivateKeyJwt()
    const token = await oraBox.retrieveTokenUsingAuthorizationCode({
      code,
      verifier,
      redirectUri: `${REDIRECT_BASE}/return`,
      clientAssertion,
    })
    res.json(token)
  } catch (error) {
    res.status(403).json({ message: "something went wrong" })
    console.log(error)
  }
})

app.get("/api/user-bank-accounts", async (req, res) => {
  try {
    const { token } = req.query
    const bankAccounts = await oraBox.retrieveUserBankAccountsAndBalance(token)
    res.json(bankAccounts)
  } catch (error) {
    res.status(403).json({ message: "something went wrong" })
    console.log(error)
  }
})

app.use((_req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.listen(port, () => {
  console.log(`ora-api listening at http://localhost:${port}`)
})
