import { NextResponse } from "next/server"

export async function POST() {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const mockExtracted = [
    {
      id: "1",
      vendor: "AlphaTech Solutions",
      priceUSD: 22500,
      deliveryDays: 14,
      terms: "Net 30",
      confidence: 95,
    },
    {
      id: "2",
      vendor: "Thornwell Manufacturing",
      priceUSD: 22000,
      deliveryDays: 21,
      terms: "2/10 Net 30",
      confidence: 92,
    },
  ]

  return NextResponse.json(mockExtracted)
}
