import { type NextRequest, NextResponse } from "next/server"
import { unlink, readdir } from "fs/promises"
import path from "path"
import sqlite3 from "sqlite3"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Clear SQLite database
    const dbPath = "data/chatbot.db"
    try {
      const db = new sqlite3.Database(dbPath)

      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run("DELETE FROM universities", (err) => {
            if (err) reject(err)
          })
          db.run("DELETE FROM conversation_history", (err) => {
            if (err) reject(err)
            else resolve(true)
          })
        })
        db.close()
      })
    } catch (error) {
      console.error("Database clear error:", error)
    }

    // Clear scraped_data directory
    try {
      const scrapedDir = "scraped_data"
      const files = await readdir(scrapedDir)
      for (const file of files) {
        if (file.endsWith(".txt")) {
          await unlink(path.join(scrapedDir, file))
        }
      }
    } catch (error) {
      console.error("Scraped data clear error:", error)
    }

    // Clear vectorstore
    try {
      await unlink("vectorstore/index.faiss")
      await unlink("vectorstore/chunks.pkl")
    } catch (error) {
      console.error("Vectorstore clear error:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Database and all data cleared successfully",
    })
  } catch (error) {
    console.error("Clear database API error:", error)
    return NextResponse.json({ error: "Failed to clear database" }, { status: 500 })
  }
}
