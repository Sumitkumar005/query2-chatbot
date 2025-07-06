"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Mic,
  ThumbsUp,
  ThumbsDown,
  LogOut,
  User,
  MessageCircle,
  Upload,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { LoginDialog } from "@/components/login-dialog"

interface Message {
  type: "user" | "bot"
  content: string
  followUps?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [language, setLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    const newMessage: Message = { type: "user", content: input }
    setMessages((prev) => [...prev, newMessage])
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, language, history: messages.slice(-5) }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: data.text, followUps: data.followUps },
        ])
      } else {
        toast.error(data.text || "Failed to get response")
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: "Sorry, something went wrong. Please try again." },
        ])
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.")
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Network error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFollowUp = (followUp: string) => {
    setInput(followUp)
    handleSend()
  }

  const handleFeedback = (index: number, feedback: "up" | "down") => {
    toast.success(`Feedback recorded: ${feedback === "up" ? "Thumbs Up" : "Thumbs Down"}`)
  }

  const handleTTS = async (text: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      } else {
        toast.error("Failed to generate audio")
      }
    } catch (error) {
      toast.error("Error playing audio")
    }
  }

  const handleReindex = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Please log in to perform this action")
        setLoginOpen(true)
        return
      }
      const response = await fetch("/api/admin/reindex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(`Reindexed ${data.chunks} chunks from ${data.files} files`)
      } else {
        throw new Error(data.error || "Failed to reindex data")
      }
    } catch (error) {
      toast.error(`Reindex failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Please log in to perform this action")
        setLoginOpen(true)
        return
      }
      const response = await fetch("/api/admin/delete-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ files: [] }), // Update with selected files if needed
      })

      const data = await response.json()
      if (response.ok) {
        toast.success("Data deleted successfully")
      } else {
        throw new Error(data.error || "Failed to delete data")
      }
    } catch (error) {
      toast.error(`Delete failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/10 backdrop-blur-md p-6 border-r border-white/20 hidden lg:block">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Visamonk Chat</span>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            onClick={() => setMessages([])}
          >
            New Chat
          </Button>

          {isAuthenticated ? (
            <>
              <Link href="/admin">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                  Admin Panel
                </Button>
              </Link>
              <Link href="/admin#upload">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </Link>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full"
                onClick={handleDeleteData}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Data
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
                onClick={handleReindex}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reindex Data
              </Button>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Profile</h3>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:bg-red-600/10 mt-2"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => setLoginOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white/20 border-white/30">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Example Questions</h3>
            {[
              "What is the tuition at MIT?",
              "Which universities offer Computer Science?",
              "What is visamonk.ai?",
            ].map((q, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left text-gray-700 hover:bg-white/20"
                onClick={() => setInput(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-6">
        <ScrollArea className="flex-1 mb-6 bg-white/10 backdrop-blur-md rounded-xl p-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-700 mt-20">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start a conversation by typing a question below!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-20"
                    : "bg-white/20 text-gray-800 mr-20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p>{msg.content}</p>
                  {msg.type === "bot" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTTS(msg.content)}
                        className="text-gray-600 hover:bg-white/20"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(index, "up")}
                        className="text-gray-600 hover:bg-white/20"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(index, "down")}
                        className="text-gray-600 hover:bg-white/20"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Suggested follow-ups:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.followUps.map((followUp, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollowUp(followUp)}
                          className="text-gray-700 border-gray-300 hover:bg-gray-100"
                        >
                          {followUp}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>

        <Card className="bg-white/20 backdrop-blur-md border-white/30">
          <CardContent className="p-4 flex items-center space-x-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent border-white/30 text-gray-800 placeholder-gray-500 rounded-full"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:bg-white/20">
              <Mic className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}