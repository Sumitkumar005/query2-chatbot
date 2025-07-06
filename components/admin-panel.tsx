"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Trash2, RefreshCw, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminPanel() {
  const [scrapeUrl, setScrapeUrl] = useState("https://www.visamonk.ai/")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleScrapeWebsite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: scrapeUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Scraped ${data.pages} pages successfully`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape website",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "File uploaded successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReindexData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/reindex", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Data reindexed successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reindex data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Admin Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scrape" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="scrape" className="text-slate-300 data-[state=active]:text-white">
              Scrape
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-slate-300 data-[state=active]:text-white">
              Upload
            </TabsTrigger>
            <TabsTrigger value="manage" className="text-slate-300 data-[state=active]:text-white">
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scrape" className="space-y-4">
            <div>
              <Label htmlFor="scrape-url" className="text-slate-300">
                Website URL
              </Label>
              <Input
                id="scrape-url"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://www.visamonk.ai/"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={handleScrapeWebsite}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Globe className="h-4 w-4 mr-2" />
              {isLoading ? "Scraping..." : "Scrape Website"}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-slate-300">
                Upload File
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.sql,.pdf,.txt"
                onChange={handleFileUpload}
                className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0"
              />
            </div>
            <p className="text-xs text-slate-400">Supported formats: CSV, XLSX, SQL, PDF, TXT</p>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Button
              onClick={handleReindexData}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isLoading ? "Reindexing..." : "Reindex Data"}
            </Button>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Database
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
