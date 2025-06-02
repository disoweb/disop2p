import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Verify user is part of this trade
    const tradeCheck = await sql`
      SELECT id FROM trades 
      WHERE id = ${params.id} 
      AND (buyer_id = ${userId} OR seller_id = ${userId})
    `

    if (tradeCheck.length === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    // Get messages
    const messages = await sql`
      SELECT m.*, u.first_name || ' ' || u.last_name as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.trade_id = ${params.id}
      ORDER BY m.created_at ASC
    `

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      isMe: msg.sender_id === userId,
      senderName: msg.sender_name,
      timestamp: new Date(msg.created_at).toLocaleTimeString(),
      createdAt: msg.created_at,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId
    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Verify user is part of this trade
    const tradeCheck = await sql`
      SELECT id FROM trades 
      WHERE id = ${params.id} 
      AND (buyer_id = ${userId} OR seller_id = ${userId})
    `

    if (tradeCheck.length === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    // Insert message
    const result = await sql`
      INSERT INTO messages (trade_id, sender_id, content)
      VALUES (${params.id}, ${userId}, ${message})
      RETURNING *
    `

    return NextResponse.json({
      message: "Message sent successfully",
      messageId: result[0].id,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
