"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, MessageCircle, Globe, Shield, Zap, Award, ChevronRight, User } from "lucide-react"
import Link from "next/link"
import { LoginDialog } from "@/components/login-dialog"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Visamonk</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              About
            </Link>
            <Link href="/solutions" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Solutions
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Contact
            </Link>
            {user ? (
              <Link href="/admin">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => setLoginOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
            <Link href="/chat">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium">
                Try Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <Badge className="mb-6 bg-white/20 text-gray-800 border-white/30 backdrop-blur-sm">
              <Award className="h-4 w-4 mr-2" />
              Digital Innovation of the Year Finalist - The PIEoneer Award 2025
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Visarobot.ai
              </span>
            </h1>

            <p className="text-xl text-gray-700 mb-8 max-w-xl leading-relaxed">
              Discover the power of our AI chatbot, where university queries are seamlessly answered using Google Gemini
              API, Tavily web scraping, and RAG
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/10 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Multilingual Support</h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed">
              Our AI chatbot seamlessly communicates in multiple languages, ensuring a personalized and inclusive
              experience for students and faculty from diverse backgrounds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <MessageCircle className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-3">Personalized Replies</h3>
                <p className="text-pink-100 mb-4 leading-relaxed">
                  Our advanced natural language processing capabilities allow the chatbot to provide personalized
                  responses.
                </p>
                <Button variant="ghost" className="text-white hover:bg-white/20 p-0 font-medium">
                  Try it Now →
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-xl">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Data Management</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Visarobot.ai prioritizes the protection of sensitive university data, with robust security measures
                  and strict data governance protocols in place.
                </p>
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-600/10 p-0 font-medium">
                  Learn More →
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-3">Admin Upload and Scrape</h3>
                <p className="text-red-100 mb-4 leading-relaxed">
                  Empower your university's administrative team with the ability to easily upload and scrape relevant
                  data, streamlining the data acquisition process.
                </p>
                <Button variant="ghost" className="text-white hover:bg-white/20 p-0 font-medium">
                  Get Started →
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-3">Seamless Integration</h3>
                <p className="text-purple-100 mb-4 leading-relaxed">
                  Visarobot.ai seamlessly integrates with your university's existing systems and platforms, providing a
                  seamless and efficient user experience.
                </p>
                <Button variant="ghost" className="text-white hover:bg-white/20 p-0 font-medium">
                  Learn More →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* University Trust Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Students from global universities have trusted us for their Visa Interview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-60">
            {[
              "FAU Atlantic University",
              "University of Texas",
              "Cornell University",
              "Webster University",
              "NJIT",
              "University of Illinois Chicago",
              "Texas A&M University",
              "University of Michigan",
            ].map((university, index) => (
              <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                  {university.split(" ")[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Visa Interview Don't Have to be Uncertain Anymore</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
            Get AI-powered practice and insights to help you prepare and perform your best.
          </p>
          <Link href="/chat">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Early Access →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold">Visamonk</span>
              </div>
              <p className="text-slate-400 text-sm">
                © 2025 Visamonk Inc.
                <br />
                All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Resources</h4>
              <div className="space-y-2">
                <Link href="/faqs" className="block text-slate-400 hover:text-white transition-colors">
                  FAQs
                </Link>
                <Link href="/blog" className="block text-slate-400 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link href="/careers" className="block text-slate-400 hover:text-white transition-colors">
                  Careers
                </Link>
                <Link href="/partners" className="block text-slate-400 hover:text-white transition-colors">
                  Partners
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link href="/team" className="block text-slate-400 hover:text-white transition-colors">
                  Our Team
                </Link>
                <Link href="/careers" className="block text-slate-400 hover:text-white transition-colors">
                  Careers
                </Link>
                <Link href="/contact" className="block text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Connect</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                  LinkedIn
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                  Twitter
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                  Facebook
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                  Instagram
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}