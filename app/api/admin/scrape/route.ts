import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { url, keepOldData } = await request.json()

    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Call Python subprocess for web scraping
    const result = await scrapeWebsiteWithPython(url, keepOldData)

    return NextResponse.json({
      success: true,
      pages: result.pages,
      message: `Successfully scraped ${result.pages} pages from ${url}`,
    })
  } catch (error) {
    console.error("Scrape API error:", error)
    return NextResponse.json({ error: "Failed to scrape website" }, { status: 500 })
  }
}

async function scrapeWebsiteWithPython(url: string, keepOldData: boolean): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "web_scraper.py")
    const pythonProcess = spawn("python", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    const inputData = JSON.stringify({ url, keepOldData })
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
          reject(new Error("Failed to parse scraping result"))
        }
      } else {
        console.error("Scraping Python process error:", errorData)
        reject(new Error("Web scraping failed"))
      }
    })

    pythonProcess.stdin.write(inputData)
    pythonProcess.stdin.end()
  })
}
