"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bot,
  Send,
  Mic,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Globe,
  MessageCircle,
  User,
  Trash2,
  Menu,
  X,
  Upload,
  RefreshCw,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { FloatingParticles } from "@/components/floating-particles"
import { useAuth } from "@/hooks/use-auth"
import { LoginDialog } from "@/components/login-dialog"
import { ProfessionalRobot3D } from "@/components/professional-robot-3d"
import { AdminPanelEnhanced } from "@/components/admin-panel-enhanced"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  followUps?: string[]
  feedback?: "positive" | "negative"
}

const LANGUAGES = {
  English: "en",
  Hindi: "hi",
  Spanish: "es",
  French: "fr",
  German: "de",
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "bot",
        content:
          "Welcome to Visarobot.ai! I'm here to help you with university information, visa requirements, and admission queries. How can I assist you today?",
        timestamp: new Date(),
        followUps: [
          "What programs does MIT offer?",
          "Tell me about visa requirements",
          "What are the tuition fees for Computer Science?",
          "How do I apply for a student visa?",
        ],
      }
      setMessages([welcomeMessage])
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          language: LANGUAGES[selectedLanguage],
          history: messages.slice(-5),
        }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.response,
        timestamp: new Date(),
        followUps: data.followUps || [],
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUp = (question: string) => {
    setInput(question)
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))
  }

  const playAudio = async (text: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language: LANGUAGES[selectedLanguage] }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />

            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
              <ProfessionalRobot3D position={[3, 0, -2]} scale={0.5} />
            </Float>

            <FloatingParticles count={15} />

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
          </Suspense>
        </Canvas>
      </div>

      {/* Sidebar */}
      <div
        className={`${showSidebar ? "w-80" : "w-0"} transition-all duration-300 bg-slate-800/90 backdrop-blur-md border-r border-slate-700 overflow-hidden`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Visarobot.ai</h2>
                <p className="text-xs text-slate-400">AI University Assistant</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          {isAuthenticated ? (
            <Card className="bg-slate-700/50 border-slate-600 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user?.email}</p>
                    <p className="text-xs text-slate-400">{user?.isAdmin ? "Administrator" : "User"}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-white">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-700/50 border-slate-600 mb-6">
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 mb-3">Sign in for personalized experience</p>
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={clearChat}
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                New Chat
              </Button>
              {isAuthenticated && user?.isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Upload className="h-4 w-4 mr-3" />
                    Upload Files
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-3" />
                    Reindex Data
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Example Questions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Example Questions</h3>
            <div className="space-y-2">
              {[
                "What programs does MIT offer?",
                "What are the tuition fees for Computer Science?",
                "Tell me about visa requirements",
                "How do I apply for a student visa?",
                "What documents do I need for F-1 visa?",
                "Which universities offer scholarships?",
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left text-sm text-slate-400 hover:text-white hover:bg-slate-700 h-auto p-3 whitespace-normal leading-relaxed"
                  onClick={() => handleFollowUp(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {showSidebar && isAuthenticated && user?.isAdmin && (
          <div className="mt-6">
            <AdminPanelEnhanced />
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-slate-300 hover:text-white"
              >
                {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">University Assistant</h1>
                  <p className="text-xs text-slate-400">Powered by Google Gemini & RAG</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 ml-2" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {Object.keys(LANGUAGES).map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-white hover:bg-slate-600">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to Visarobot.ai</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                I'm your AI-powered university assistant. Ask me anything about universities, programs, visa
                requirements, or admission processes!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl ${message.type === "user" ? "ml-12" : "mr-12"}`}>
                <div className="flex items-start space-x-3 mb-2">
                  {message.type === "bot" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-slate-300">
                        {message.type === "bot" ? "Visarobot.ai" : "You"}
                      </span>
                      <span className="text-xs text-slate-500">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {message.type === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <Card
                  className={`${
                    message.type === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 ml-11"
                      : "bg-slate-800/80 backdrop-blur-md border-slate-700 text-white ml-11"
                  } shadow-lg`}
                >
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                    {message.type === "bot" && (
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playAudio(message.content)}
                            className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-400 hover:text-white"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(message.id, "positive")}
                            className={`h-8 w-8 p-0 hover:bg-slate-700 ${
                              message.feedback === "positive" ? "text-green-400" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(message.id, "negative")}
                            className={`h-8 w-8 p-0 hover:bg-slate-700 ${
                              message.feedback === "negative" ? "text-red-400" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {message.feedback && (
                          <Badge variant="secondary" className="text-xs">
                            {message.feedback === "positive" ? "👍 Helpful" : "👎 Not helpful"}
                          </Badge>
                        )}
                      </div>
                    )}

                    {message.followUps && message.followUps.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-700">
                        <p className="text-sm font-medium text-slate-300 mb-3">Follow-up questions:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.followUps.map((followUp, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleFollowUp(followUp)}
                              className="text-xs border-slate-600 hover:bg-slate-700 bg-transparent text-slate-300 hover:text-white"
                            >
                              {followUp}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl mr-12">
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-300">Visarobot.ai</span>
                  </div>
                </div>

                <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700 ml-11">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-slate-400 text-sm">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-800/90 backdrop-blur-md border-t border-slate-700">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question about universities, visas, or admissions..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-12 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent h-12 w-12 p-0"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-12 px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}
