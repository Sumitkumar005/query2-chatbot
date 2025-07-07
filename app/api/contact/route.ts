import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const dbPath = path.join(process.cwd(), "data", "chatbot.db")
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        timestamp TEXT
      )
    `)

    await db.run(
      "INSERT INTO contact_messages (name, email, message, timestamp) VALUES (?, ?, ?, ?)",
      [name, email, message, new Date().toISOString()]
    )

    await db.close()
    return NextResponse.json({ message: "Contact message saved successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}