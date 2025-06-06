"use client"

import { Button } from "@/components/ui/button"
import { useQuoteStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import QuoteCard from "./QuoteCard"

export default function QuoteWizard() {
  const { quotes, loadDemoData, setCurrentStep } = useQuoteStore()
  const router = useRouter()
  const { toast } = useToast()

  const handleAnalyze = () => {
    if (quotes.length > 3) {
      toast({
        title: "Too many quotes",
        description: "Max 3 quotes supported in MVP.",
        variant: "destructive",
      })
      return
    }

    setCurrentStep(2)
    router.push("/compare")
  }

  const handleLoadDemo = () => {
    loadDemoData()
    toast({
      title: "Demo data loaded",
      description: "Sample quotes have been loaded for testing.",
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Vendor Quotes</h2>
        <p className="text-gray-600">Add up to 3 quotes for AI analysis and comparison</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => (
          <QuoteCard key={index} index={index} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button onClick={handleLoadDemo} variant="outline" className="w-full sm:w-auto">
          Load Demo Data
        </Button>

        <Button
          onClick={handleAnalyze}
          disabled={quotes.length === 0}
          className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90"
        >
          Analyze Quotes with AI
        </Button>
      </div>

      {quotes.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900 mb-3">Uploaded Quotes ({quotes.length})</h3>
          <div className="space-y-2">
            {quotes.map((quote) => (
              <div key={quote.id} className="flex items-center justify-between text-sm">
                <span>{quote.filename || "Text Input"}</span>
                <span className="text-gray-500">{quote.language}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
