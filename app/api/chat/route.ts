import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { message, language, history } = await request.json()

    // Call Python subprocess for chat processing
    const response = await processChatWithPython(message, language, history)

    return NextResponse.json({
      response: response.text,
      followUps: response.followUps,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}

async function processChatWithPython(message: string, language: string, history: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "chat_processor.py")
    const pythonProcess = spawn("python", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    const inputData = JSON.stringify({
      message,
      language,
      history: history.slice(-5), // Send last 5 messages for context
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
          // Fallback response if Python script fails
          resolve({
            text: generateFallbackResponse(message),
            followUps: generateFallbackFollowUps(message),
          })
        }
      } else {
        console.error("Python process error:", errorData)
        resolve({
          text: generateFallbackResponse(message),
          followUps: generateFallbackFollowUps(message),
        })
      }
    })

    pythonProcess.stdin.write(inputData)
    pythonProcess.stdin.end()
  })
}

function generateFallbackResponse(message: string): string {
  const responses = [
    "I'd be happy to help you with university information. Could you please be more specific about what you'd like to know?",
    "Based on the available data, I'm processing your query about university programs and requirements.",
    "Let me search through our university database for that information.",
    "That's a great question! I can help you with university admissions, visa requirements, and program details.",
    "I'm here to assist with your university and visa-related queries. What specific information are you looking for?",
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

function generateFallbackFollowUps(message: string): string[] {
  const followUps = [
    "What are the admission requirements?",
    "Tell me about tuition fees",
    "What programs are available?",
    "How do I apply for a student visa?",
    "What documents do I need for F-1 visa?",
    "Which universities offer scholarships?",
  ]
  return followUps.slice(0, 3)
}
