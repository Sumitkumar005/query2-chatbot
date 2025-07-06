import { type NextRequest, NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import path from "path"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
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

    const files: any[] = []

    // Check data directory
    try {
      const dataFiles = await readdir("data")
      for (const file of dataFiles) {
        if (file !== "chatbot.db") {
          const filePath = path.join("data", file)
          const stats = await stat(filePath)
          files.push({
            name: file,
            size: stats.size,
            type: path.extname(file).substring(1).toUpperCase() || "Unknown",
            uploadDate: stats.mtime.toLocaleDateString(),
            directory: "data",
          })
        }
      }
    } catch (error) {
      console.error("Error reading data directory:", error)
    }

    // Check scraped_data directory
    try {
      const scrapedFiles = await readdir("scraped_data")
      for (const file of scrapedFiles) {
        const filePath = path.join("scraped_data", file)
        const stats = await stat(filePath)
        files.push({
          name: file,
          size: stats.size,
          type: path.extname(file).substring(1).toUpperCase() || "Unknown",
          uploadDate: stats.mtime.toLocaleDateString(),
          directory: "scraped_data",
        })
      }
    } catch (error) {
      console.error("Error reading scraped_data directory:", error)
    }

    return NextResponse.json({
      success: true,
      files: files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()),
    })
  } catch (error) {
    console.error("Files API error:", error)
    return NextResponse.json({ error: "Failed to load files" }, { status: 500 })
  }
}
