import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import { writeFile, mkdir } from "fs/promises"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Save file to data directory
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await mkdir("data", { recursive: true })
    const filePath = path.join("data", file.name)
    await writeFile(filePath, buffer)

    // Process file with Python subprocess
    const result = await processFileWithPython(filePath, file.name)

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      message: "File uploaded and processed successfully",
      result,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

async function processFileWithPython(filePath: string, fileName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "file_processor.py")
    const pythonProcess = spawn("python", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    const inputData = JSON.stringify({ filePath, fileName })
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
          resolve({ processed: true })
        }
      } else {
        console.error("File processing Python error:", errorData)
        resolve({ processed: false, error: errorData })
      }
    })

    pythonProcess.stdin.write(inputData)
    pythonProcess.stdin.end()
  })
}