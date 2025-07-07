"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center text-gray-800">
        <h1 className="text-4xl font-bold mb-6">Our Solutions</h1>
        <p className="text-lg mb-4">
          Visamonk offers comprehensive solutions for international students, including:
        </p>
        <ul className="text-lg mb-6 text-left list-disc list-inside">
          <li>University program search and comparison</li>
          <li>Tuition and scholarship information</li>
          <li>Visa application guidance (F-1, J-1, etc.)</li>
          <li>AI-powered chatbot for instant queries</li>
          <li>Document preparation and admission support</li>
        </ul>
        <Link href="/chat">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}