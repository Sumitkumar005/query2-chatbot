"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("auth_token")
      if (token) {
        try {
          const response = await fetch("/api/auth/verify", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const data = await response.json()
            setUser({ email: data.email })
          } else {
            localStorage.removeItem("auth_token")
            setUser(null)
          }
        } catch (error) {
          localStorage.removeItem("auth_token")
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    verifyToken()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("auth_token", data.token)
        setUser({ email })
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    router.push("/")
  }

  return { user, isLoading, login, logout }
}