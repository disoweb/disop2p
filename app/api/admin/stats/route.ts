import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get user statistics
    const userStats = await sql(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN kyc_status = 'verified' THEN 1 END) as verified_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `)

    // Get trade statistics
    const tradeStats = await sql(`
      SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_trades,
        COUNT(CASE WHEN status = 'pending' OR status = 'in_escrow' THEN 1 END) as active_trades,
        COUNT(CASE WHEN status = 'disputed' THEN 1 END) as disputed_trades,
        SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_volume
      FROM trades
    `)

    // Get KYC statistics
    const kycStats = await sql(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_kyc,
        COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_kyc,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_kyc
      FROM kyc_documents
    `)

    // Get fraud statistics
    const fraudStats = await sql(`
      SELECT 
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN blocked = true THEN 1 END) as blocked_users,
        COUNT(CASE WHEN risk_score >= 80 THEN 1 END) as high_risk_alerts,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as alerts_24h
      FROM fraud_logs
    `)

    // Get recent activity
    const recentActivity = await sql(`
      SELECT 
        'user_registration' as type,
        first_name || ' ' || last_name as description,
        created_at as timestamp
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      
      UNION ALL
      
      SELECT 
        'trade_completed' as type,
        'Trade ' || id || ' completed' as description,
        completed_at as timestamp
      FROM trades 
      WHERE completed_at >= NOW() - INTERVAL '24 hours'
      
      ORDER BY timestamp DESC
      LIMIT 10
    `)

    return NextResponse.json({
      success: true,
      data: {
        users: userStats[0],
        trades: tradeStats[0],
        kyc: kycStats[0],
        fraud: fraudStats[0],
        recentActivity,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
