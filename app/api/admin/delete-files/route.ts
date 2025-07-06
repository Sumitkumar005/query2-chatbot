import { type NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
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

    const { files } = await request.json()

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid files array" }, { status: 400 })
    }

    let deletedCount = 0
    const errors: string[] = []

    for (const fileName of files) {
      try {
        // Check in data directory
        const dataPath = path.join("data", fileName)
        try {
          await unlink(dataPath)
          deletedCount++
          continue
        } catch (e) {
          // File not in data directory, try scraped_data
        }

        // Check in scraped_data directory
        const scrapedPath = path.join("scraped_data", fileName)
        try {
          await unlink(scrapedPath)
          deletedCount++
        } catch (e) {
          errors.push(`File not found: ${fileName}`)
        }
      } catch (error) {
        errors.push(`Error deleting ${fileName}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Deleted ${deletedCount} file(s) successfully`,
    })
  } catch (error) {
    console.error("Delete files API error:", error)
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 })
  }
}
