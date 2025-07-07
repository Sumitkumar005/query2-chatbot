"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center text-gray-800">
        <h1 className="text-4xl font-bold mb-6">About Visamonk</h1>
        <p className="text-lg mb-4">
          Visamonk is your trusted partner for navigating university admissions and visa processes. We provide personalized guidance on programs, tuition, and visa requirements to help students achieve their academic dreams abroad.
        </p>
        <p className="text-lg mb-6">
          Our AI-powered chatbot delivers instant answers about universities, programs, and visa services, backed by a robust database and real-time web scraping. Whether you're exploring MIT, Stanford, or Visamonk University, we're here to help!
        </p>
        <Link href="/chat">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
            Try Our Chatbot
          </Button>
        </Link>
      </div>
    </div>
  )
}