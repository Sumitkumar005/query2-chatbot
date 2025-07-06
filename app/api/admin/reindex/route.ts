import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    // Call Python subprocess for data reindexing
    const result = await reindexDataWithPython()

    return NextResponse.json({
      success: true,
      message: "Data reindexed successfully",
      chunks: result.chunks,
      files: result.files,
    })
  } catch (error) {
    console.error("Reindex API error:", error)
    return NextResponse.json({ error: "Failed to reindex data" }, { status: 500 })
  }
}

async function reindexDataWithPython(): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "data_indexer.py")
    const pythonProcess = spawn("python", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    let outputData = ""
    let errorData = ""

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString()
    })

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(outputData)
          resolve(result)
        } catch (parseError) {
          resolve({ chunks: 0, files: 0 })
        }
      } else {
        console.error("Reindexing Python process error:", errorData)
        reject(new Error("Data reindexing failed"))
      }
    })

    pythonProcess.stdin.end()
  })
}
