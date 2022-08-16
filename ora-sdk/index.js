const axios = require("axios")
const fs = require("fs")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

class OraBox {
  constructor({ clientId, scopes, pemCert }) {
    this.clientId = clientId
    this.scopes = scopes
    this.pemCert = pemCert
  }

  base64UrlEncode(byteArray) {
    const encodedString = Buffer.from(byteArray).toString("base64")
    return encodedString.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  async sha256(verifier) {
    const msgBuffer = new TextEncoder().encode(verifier)
    const hashBuffer = await crypto.webcrypto.subtle.digest("SHA-256", msgBuffer)
    return new Uint8Array(hashBuffer)
  }

  async generateVerifierChallengePair() {
    const randomBytes = crypto.webcrypto.getRandomValues(new Uint8Array(32))
    const verifier = this.base64UrlEncode(randomBytes)
    const challenge = await this.sha256(verifier).then(this.base64UrlEncode)
    return { verifier, challenge }
  }

  generateRandomStateAndNonce() {
    const randomBytes = crypto.webcrypto.getRandomValues(new Uint8Array(32))
    const state = this.base64UrlEncode(randomBytes)
    const nonce = this.base64UrlEncode(randomBytes)
    return { state, nonce }
  }

  async buildAuthorizationUrl(challenge, redirectUri) {
    const { state, nonce } = this.generateRandomStateAndNonce()
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: this.scopes.join(" "),
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    })

    return `https://secure.stitch.money/connect/authorize?${params.toString()}`
  }

  getKeyId(cert) {
    const lines = cert.split("\n").filter((x) => x.includes("localKeyID:"))[0]
    const result = lines.replace("localKeyID:", "").replace(/\W/g, "")
    return result
  }

  generatePrivateKeyJwt() {
    const pemCert = fs.readFileSync(this.pemCert, "utf8")
    const issuer = this.clientId
    const subject = this.clientId
    const audience = "https://secure.stitch.money/connect/token"
    const keyid = this.getKeyId(pemCert)
    const jwtid = crypto.randomBytes(16).toString("hex")
    //convert jwtidCrpto to base
    const options = {
      keyid,
      jwtid,
      notBefore: "0",
      issuer,
      subject,
      audience,
      expiresIn: "5m", // For this example this value is set to 5 minutes, but for machine usage should generally be a lot shorter
      algorithm: "RS256",
    }

    const token = jwt.sign({}, pemCert, options)
    return token
  }

  async retrieveTokenUsingAuthorizationCode({ redirectUri, verifier, code, clientAssertion }) {
    const body = {
      grant_type: "authorization_code",
      client_id: this.clientId,
      code: code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      client_assertion: clientAssertion,
      client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    }

    const bodyString = Object.entries(body)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&")
    const response = await axios.post("https://secure.stitch.money/connect/token", bodyString, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    return response.data
  }

  async retrieveUserBankAccountsAndBalance(token) {
    let listAccountQuery = `query ListBankAccountsuser {
      user{
            bankAccounts {
                name
                availableBalance
                accountNumber
                currency
            }
          }
        }`

    const response = await axios({
      url: "https://api.stitch.money/graphql",
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        query: listAccountQuery,
      },
      mode: "cors",
      credentials: "include",
    })

    return response.data
  }
}

module.exports = OraBox
