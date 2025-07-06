import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  color: string
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:border-slate-600 transition-all duration-300 group">
      <CardContent className="p-6">
        <div
          className={`w-16 h-16 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-slate-300 mb-4 leading-relaxed">{description}</p>
        <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 p-0">
          Learn More →
        </Button>
      </CardContent>
    </Card>
  )
}
