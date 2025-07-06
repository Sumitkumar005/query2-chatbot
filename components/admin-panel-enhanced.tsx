"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Globe,
  Trash2,
  RefreshCw,
  FileText,
  Upload,
  Database,
  Settings,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileItem {
  name: string
  size: number
  type: string
  uploadDate: string
}

export function AdminPanelEnhanced() {
  const [scrapeUrl, setScrapeUrl] = useState("https://www.visamonk.ai/")
  const [keepOldData, setKeepOldData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const { toast } = useToast()

  const handleScrapeWebsite = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: scrapeUrl, keepOldData }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Scraped ${data.pages} pages successfully`,
        })
        loadUploadedFiles() // Refresh file list
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
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error)
        }
      }

      toast({
        title: "Success",
        description: `Uploaded ${files.length} file(s) successfully`,
      })

      loadUploadedFiles() // Refresh file list

      // Clear the input
      event.target.value = ""
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReindexData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/reindex", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Reindexed ${data.chunks} chunks from ${data.files} files`,
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

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Warning",
        description: "Please select files to delete",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/delete-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ files: selectedFiles }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Deleted ${selectedFiles.length} file(s) successfully`,
        })
        setSelectedFiles([])
        loadUploadedFiles() // Refresh file list
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete files",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to clear the entire database? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Database cleared successfully",
        })
        loadUploadedFiles() // Refresh file list
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUploadedFiles = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedFiles(data.files || [])
      }
    } catch (error) {
      console.error("Failed to load files:", error)
    }
  }

  // Load files on component mount
  useState(() => {
    loadUploadedFiles()
  })

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles((prev) => (prev.includes(fileName) ? prev.filter((f) => f !== fileName) : [...prev, fileName]))
  }

  return (
    <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Admin Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scrape" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="scrape" className="text-slate-300 data-[state=active]:text-white">
              <Globe className="h-4 w-4 mr-1" />
              Scrape
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-slate-300 data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="files" className="text-slate-300 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-1" />
              Files
            </TabsTrigger>
            <TabsTrigger value="manage" className="text-slate-300 data-[state=active]:text-white">
              <Database className="h-4 w-4 mr-1" />
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="keep-old-data"
                checked={keepOldData}
                onChange={(e) => setKeepOldData(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="keep-old-data" className="text-slate-300 text-sm">
                Keep existing data
              </Label>
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
                Upload Files (Multiple supported)
              </Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".csv,.xlsx,.sql,.pdf,.txt"
                onChange={handleFileUpload}
                className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0"
              />
            </div>
            <p className="text-xs text-slate-400">
              Supported formats: CSV, XLSX, SQL, PDF, TXT (Multiple files can be selected)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Auto-processing
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Auto-indexing
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-slate-300 font-medium">Uploaded Files</h4>
              <div className="flex space-x-2">
                <Button
                  onClick={loadUploadedFiles}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleDeleteFiles}
                  size="sm"
                  variant="destructive"
                  disabled={selectedFiles.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedFiles.length})
                </Button>
              </div>
            </div>

            <ScrollArea className="h-48 w-full border border-slate-600 rounded p-2">
              {uploadedFiles.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No files uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedFiles.includes(file.name) ? "bg-slate-600" : "bg-slate-700 hover:bg-slate-650"
                      }`}
                      onClick={() => toggleFileSelection(file.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.name)}
                          onChange={() => toggleFileSelection(file.name)}
                          className="rounded"
                        />
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-slate-300 text-sm font-medium">{file.name}</p>
                          <p className="text-slate-400 text-xs">
                            {file.type} • {(file.size / 1024).toFixed(1)} KB • {file.uploadDate}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={handleReindexData}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isLoading ? "Reindexing..." : "Reindex All Data"}
              </Button>

              <Button onClick={handleClearDatabase} disabled={isLoading} variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Clear Database
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                  <Database className="h-4 w-4 mr-2" />
                  Backup DB
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <h5 className="text-slate-300 font-medium mb-2">System Status</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Database Status:</span>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">FAISS Index:</span>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Files Indexed:</span>
                  <span className="text-slate-300">{uploadedFiles.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
