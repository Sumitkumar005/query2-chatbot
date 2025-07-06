"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminPanelEnhanced } from "@/components/admin-panel-enhanced"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null // Redirect will handle this
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <AdminPanelEnhanced />
      </div>
    </div>
  )
}