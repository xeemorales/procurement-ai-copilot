"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Clock } from "lucide-react"
import { useQuoteStore } from "@/lib/store"
import type { Quote } from "@/lib/types"

interface QuoteCardProps {
  index: number
}

export default function QuoteCard({ index }: QuoteCardProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [textContent, setTextContent] = useState("")
  const [language, setLanguage] = useState("English")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { addQuote, quotes } = useQuoteStore()
  const currentQuote = quotes[index]

  // ----------------------------------------------
  // Simplified handleFileSelect: read everything as text.
  // (If you want true PDF parsing later, you can install `pdfjs-dist`
  //  and follow their Next.js instructions. For now, .txt is enough.)
  // ----------------------------------------------
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // For demonstration, just read the file as plain text:
    // - .txt files will work perfectly
    // - .pdf/.png files will produce raw binary text (not fully parsed)
    // In a real build you could swap this for pdfjs-dist or a serverless OCR.
    const rawText = await file.text()

    const quote: Quote = {
      id: Math.random().toString(36).substr(2, 9),
      content: rawText,
      filename: file.name,
      language,
      uploadedBy: "Demo User",
      timestamp: new Date(),
      method: "upload",
    }
    addQuote(quote)
  }
  // ----------------------------------------------

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      const quote: Quote = {
        id: Math.random().toString(36).substr(2, 9),
        content: textContent,
        filename: "",
        language,
        uploadedBy: "Demo User",
        timestamp: new Date(),
        method: "paste",
      }
      addQuote(quote)
      setTextContent("")
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quote {index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Thai">Thai</SelectItem>
              <SelectItem value="Vietnamese">Vietnamese</SelectItem>
              <SelectItem value="Bahasa ID">Bahasa Indonesia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">Upload PDF, PNG, or TXT files</p>
              <input
                type="file"
                accept=".pdf,.png,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id={`file-upload-${index}`}
              />
              <label htmlFor={`file-upload-${index}`}>
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste your quote content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={6}
            />
            <Button onClick={handleTextSubmit} disabled={!textContent.trim()} className="w-full">
              Add Quote
            </Button>
          </TabsContent>
        </Tabs>

        {currentQuote && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{currentQuote.filename || "Text Input"}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3" />
              <span>{currentQuote.timestamp.toLocaleString()}</span>
              <span>• {currentQuote.method === "upload" ? "Uploaded" : "Pasted"}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
