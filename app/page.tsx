"use client"

import { useEffect } from "react"
import ProgressBar from "@/components/ProgressBar"
import QuoteWizard from "@/components/QuoteWizard"
import { useQuoteStore } from "@/lib/store"

export default function HomePage() {
  const { setCurrentStep } = useQuoteStore()

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ProgressBar currentStep={1} totalSteps={3} />
      <QuoteWizard />
    </div>
  )
}
