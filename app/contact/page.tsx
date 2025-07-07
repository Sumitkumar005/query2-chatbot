"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder for form submission logic
    toast.success("Message sent! We'll get back to you soon.")
    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/20 border-white/30 text-gray-800 placeholder-gray-500 rounded-full"
          />
          <Input
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 border-white/30 text-gray-800 placeholder-gray-500 rounded-full"
          />
          <Textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-white/20 border-white/30 text-gray-800 placeholder-gray-500 rounded-lg"
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            Send Message
          </Button>
        </form>
      </div>
    </div>
  )
}