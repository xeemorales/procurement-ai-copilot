"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, DollarSign, Clock, TrendingUp, Award, AlertTriangle } from "lucide-react"
import ProgressBar from "@/components/ProgressBar"
import { useQuoteStore } from "@/lib/store"
import { extractQuoteData, recommendVendor } from "@/lib/ai"
import type { ExtractedQuote } from "@/lib/types"

export default function ComparePage() {
  const { quotes, extractedQuotes, setExtractedQuotes, selectVendor, setCurrentStep } = useQuoteStore()

  const [loading, setLoading] = useState(true)
  const [recommendedId, setRecommendedId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    setCurrentStep(2)

    if (quotes.length === 0) {
      router.push("/")
      return
    }

    const analyzeQuotes = async () => {
      try {
        const extracted = await extractQuoteData(quotes)
        setExtractedQuotes(extracted)

        const recommended = await recommendVendor(extracted)
        setRecommendedId(recommended)
      } catch (error) {
        console.error("Error analyzing quotes:", error)
      } finally {
        setLoading(false)
      }
    }

    if (extractedQuotes.length === 0) {
      analyzeQuotes()
    } else {
      setLoading(false)
    }
  }, [quotes, extractedQuotes, setExtractedQuotes, setCurrentStep, router])

  const handleSelectVendor = (vendor: ExtractedQuote) => {
    selectVendor(vendor)
    setCurrentStep(3)
    router.push("/po")
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge className="bg-success text-white">High Confidence</Badge>
    if (confidence >= 70) return <Badge className="bg-warning text-white">Medium Confidence</Badge>
    return <Badge className="bg-danger text-white">Low Confidence</Badge>
  }

  const bestPrice = extractedQuotes.length > 0 ? Math.min(...extractedQuotes.map((q) => q.priceUSD)) : 0
  const fastestDelivery = extractedQuotes.length > 0 ? Math.min(...extractedQuotes.map((q) => q.deliveryDays)) : 0
  const avgConfidence =
    extractedQuotes.length > 0
      ? Math.round(extractedQuotes.reduce((sum, q) => sum + q.confidence, 0) / extractedQuotes.length)
      : 0
  const recommendedVendor = extractedQuotes.find((q) => q.id === recommendedId)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgressBar currentStep={2} totalSteps={3} />
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Quotes with AI</h2>
          <p className="text-gray-600">This may take a few moments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ProgressBar currentStep={2} totalSteps={3} />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis Complete</h2>
        <p className="text-gray-600">Review the comparison and select your preferred vendor</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Price</p>
                <p className="text-2xl font-bold">${bestPrice.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fastest Delivery</p>
                <p className="text-2xl font-bold">{fastestDelivery} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">{avgConfidence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recommended</p>
                <p className="text-lg font-bold">{recommendedVendor?.vendor || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Explanation */}
      <Card className="mb-8">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle>AI Recommendation Explanation</CardTitle>
                <ChevronDown className="h-4 w-4" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Weighting Criteria:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Price (50%): Lower cost preferred</li>
                    <li>• Delivery Time (30%): Faster delivery preferred</li>
                    <li>• Data Confidence (20%): Higher confidence in extracted data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recommendation Reasoning:</h4>
                  <p className="text-sm text-gray-600">
                    {recommendedVendor?.vendor} was selected based on the optimal balance of competitive pricing ($
                    {recommendedVendor?.priceUSD.toLocaleString()}), reasonable delivery time (
                    {recommendedVendor?.deliveryDays} days), and high data confidence ({recommendedVendor?.confidence}
                    %).
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Quote Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Vendor</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Delivery</th>
                  <th className="text-left p-4">Terms</th>
                  <th className="text-left p-4">Confidence</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {extractedQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{quote.vendor}</div>
                      {quote.id === recommendedId && <Badge className="bg-success text-white mt-1">Recommended</Badge>}
                    </td>
                    <td className="p-4">${quote.priceUSD.toLocaleString()}</td>
                    <td className="p-4">{quote.deliveryDays} days</td>
                    <td className="p-4">{quote.terms}</td>
                    <td className="p-4">{getConfidenceBadge(quote.confidence)}</td>
                    <td className="p-4">
                      {quote.issues && quote.issues.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-danger" />
                          <Badge className="bg-danger text-white">Manual Review</Badge>
                        </div>
                      ) : (
                        <Badge variant="outline">Ready</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        onClick={() => handleSelectVendor(quote)}
                        disabled={quote.confidence < 70}
                        size="sm"
                        className="bg-brand-blue hover:bg-brand-blue/90"
                      >
                        Select Vendor
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {recommendedVendor && (
        <div className="mt-8 text-center">
          <Button
            onClick={() => handleSelectVendor(recommendedVendor)}
            size="lg"
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            Select Recommended Vendor
          </Button>
        </div>
      )}
    </div>
  )
}
