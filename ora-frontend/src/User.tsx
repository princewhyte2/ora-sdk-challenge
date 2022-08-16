import axios from "axios"
import { useEffect, useState } from "react"

export default function User() {
  const [userDetails, setUserDetails] = useState([])

  useEffect(() => {
    const userToken = localStorage.getItem("access_token")
    if (!userToken) return
    axios
      .get(`/api/user-bank-accounts?token=${userToken}`)
      .then((res) => {
        setUserDetails(res.data.data.user.bankAccounts)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account Number</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {userDetails.length &&
            userDetails.map((bankAccounts: any) => (
              <tr key={bankAccounts.accountNumber}>
                <td>{bankAccounts.name}</td>
                <td>{bankAccounts.accountNumber}</td>
                <td>{`${bankAccounts.availableBalance.currency} ${bankAccounts.availableBalance.quantity}`}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
