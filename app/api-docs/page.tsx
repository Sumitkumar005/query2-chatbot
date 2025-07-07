"use client"

import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import { useEffect, useState } from "react"
import yaml from "js-yaml"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ApiDocs() {
  const [spec, setSpec] = useState<object | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    console.log("Fetching openapi.yaml...")
    fetch("/openapi.yaml")
      .then((res) => {
        console.log("Fetch response status:", res.status)
        if (!res.ok) {
          throw new Error(`Failed to fetch openapi.yaml: ${res.status}`)
        }
        return res.text()
      })
      .then((yamlText) => {
        console.log("Parsing YAML...")
        const parsedSpec = yaml.load(yamlText) as object
        setSpec(parsedSpec)
      })
      .catch((err) => {
        console.error("Error loading Swagger spec:", err)
        setError(`Failed to load API documentation: ${err.message}`)
      })
  }, [])

  const handleLogin = async () => {
    try {
      console.log("Attempting login with:", { email, password })
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      console.log("Login response:", data)
      if (response.ok) {
        setToken(data.token)
        toast.success("Login successful! Token set for admin endpoints.")
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Network error during login")
    }
  }

  if (error) {
    return <div className="text-red-600 p-6">{error}</div>
  }

  if (!spec) {
    return <div className="p-6">Loading API documentation...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-6">
      {!token && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-white/20 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Login for Admin APIs</h2>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
            Login
          </Button>
        </div>
      )}
      <SwaggerUI
        spec={spec}
        requestInterceptor={(req) => {
          if (token && req.url.includes("/admin/")) {
            console.log("Adding Authorization header:", `Bearer ${token}`)
            req.headers.Authorization = `Bearer ${token}`
          }
          return req
        }}
      />
    </div>
  )
}