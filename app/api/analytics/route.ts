import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"
import { verifyAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await verifyAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbPath = path.join(process.cwd(), "data", "chatbot.db")
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    const analytics = await db.all(`
      SELECT query, COUNT(*) as count
      FROM conversation_history
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `)

    await db.close()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}