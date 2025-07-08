import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request) {
  const { message, language, history } = await request.json();
  const response = await fetch('https://visamonk-python-backend.herokuapp.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language, history }),
  });
  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const { message, language, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Call Python script for AI processing
    const pythonScript = path.join(process.cwd(), "scripts", "chat_processor.py")

    const pythonProcess = spawn("python3", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    })

    const inputData = JSON.stringify({
      message,
      language: language || "en",
      history: history || [],
    })

    pythonProcess.stdin.write(inputData)
    pythonProcess.stdin.end()

    let output = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString()
    })

    return new Promise((resolve) => {
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script error:", error)
          resolve(NextResponse.json({ error: "Failed to process message", details: error }, { status: 500 }))
        } else {
          try {
            const result = JSON.parse(output)
            resolve(NextResponse.json(result))
          } catch (parseError) {
            console.error("Failed to parse Python output:", parseError, "Output:", output)
            resolve(NextResponse.json({ error: "Invalid response format", details: error }, { status: 500 }))
          }
        }
      })
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
