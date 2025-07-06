import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt:", { email, password }) // Debug log

    // In production, verify credentials against database
    if (email === "admin@visamonk.ai" && password === "admin123") {
      const user = {
        id: "1",
        email: email,
        isAdmin: true,
      }

      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "24h" })

      console.log("Login successful, token generated") // Debug log

      return NextResponse.json({
        success: true,
        token,
        user,
      })
    }

    console.log("Invalid credentials provided") // Debug log
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
