import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    // Call Python subprocess for TTS generation
    const audioBuffer = await generateTTSWithPython(text, language)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("TTS API error:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}

async function generateTTSWithPython(text: string, language: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "tts_generator.py")
    const pythonProcess = spawn("python", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    const inputData = JSON.stringify({ text, language })
    let outputBuffer = Buffer.alloc(0)
    let errorData = ""

    pythonProcess.stdout.on("data", (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data])
    })

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString()
    })

    pythonProcess.on("close", (code) => {
      if (code === 0 && outputBuffer.length > 0) {
        resolve(outputBuffer)
      } else {
        console.error("TTS Python process error:", errorData)
        reject(new Error("TTS generation failed"))
      }
    })

    pythonProcess.stdin.write(inputData)
    pythonProcess.stdin.end()
  })
}
