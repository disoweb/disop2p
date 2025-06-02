import { WithdrawalTable } from "./WithdrawalTable"
import { WithdrawalForm } from "./WithdrawalForm"
import { useWithdrawals } from "./useWithdrawals"
import { useWebSocket } from "./useWebSocket"

const WithdrawalsPage = () => {
  const { withdrawals, approveWithdrawal, rejectWithdrawal } = useWithdrawals()
  const { sendMessage } = useWebSocket()

  const handleApproval = (id: string, reason: string) => {
    approveWithdrawal(id, reason)
    sendMessage({ type: "approval", id, reason })
  }

  const handleRejection = (id: string, reason: string) => {
    rejectWithdrawal(id, reason)
    sendMessage({ type: "rejection", id, reason })
  }

  return (
    <div>
      <h1>Withdrawal Management Dashboard</h1>
      <WithdrawalForm />
      <WithdrawalTable withdrawals={withdrawals} onApprove={handleApproval} onReject={handleRejection} />
    </div>
  )
}

export default WithdrawalsPage
