import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "scraped_data")
    let files: { name: string; size: number; type: string; uploadDate: string }[] = []

    try {
      const fileNames = await fs.readdir(dataDir)
      files = await Promise.all(
        fileNames.map(async (fileName) => {
          const filePath = path.join(dataDir, fileName)
          const stats = await fs.stat(filePath)
          return {
            name: fileName,
            size: stats.size,
            type: path.extname(fileName).slice(1).toUpperCase(),
            uploadDate: stats.mtime.toISOString().split("T")[0],
          }
        })
      )
    } catch (error: any) {
      if (error.code === "ENOENT") {
        await fs.mkdir(dataDir, { recursive: true })
        console.warn("Created missing scraped_data directory")
      } else {
        throw error
      }
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error reading files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}