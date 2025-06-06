// lib/ai.ts
import type { Quote, ExtractedQuote, PurchaseOrder } from "./types"

// Helper function: attempt to parse a number from a regex match
function parseNumber(match: RegExpExecArray | null): number | undefined {
  if (!match) return undefined
  const num = match[1].replace(/,/g, "")
  const parsed = Number(num)
  return isNaN(parsed) ? undefined : parsed
}

// Regex-based field extraction from raw quote text
export async function extractQuoteData(quotes: Quote[]): Promise<ExtractedQuote[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const extracted: ExtractedQuote[] = quotes.map((quote) => {
    const text = quote.content

    // 1) Vendor name: assume appears on the first line (before a newline)
    const vendorMatch = /^(.+?)(?:\n|$)/.exec(text)
    const vendor = vendorMatch ? vendorMatch[1].trim() : "Unknown Vendor"

    // 2) Price (USD): look for "Unit Price", "Total", or a dollar amount
    const priceMatch =
      /(?:Unit Price|Unit Rate|Total):?\s*\$?([\d,]+\.\d{2})/i.exec(text) ||
      /\$([\d,]+\.\d{2})/.exec(text)
    const priceUSD = parseNumber(priceMatch) ?? 0

    // 3) Delivery time (days): look for "Delivery Time" or "Delivery"
    const deliveryMatch = /Delivery(?: Time)?:?\s*(\d+)\s*days?/i.exec(text)
    const deliveryDays = deliveryMatch ? Number(deliveryMatch[1]) : 0

    // 4) Payment terms: look for "Payment Terms" or "Terms"
    const termsMatch = /(?:Payment Terms|Terms)?:?\s*([^\n]+)/i.exec(text)
    const terms = termsMatch ? termsMatch[1].trim() : "Unknown"

    // 5) Compute a simple confidence score (0–100)
    //    - Start at 100, subtract 30 if price is missing/zero
    //    - Subtract 30 if deliveryDays is missing/zero
    //    - Subtract 20 if terms are "Unknown"
    let confidence = 100
    const issues: string[] = []

    if (priceUSD <= 0) {
      confidence -= 30
      issues.push("Missing or invalid price")
    }
    if (deliveryDays <= 0) {
      confidence -= 30
      issues.push("Missing or invalid delivery days")
    }
    if (!termsMatch) {
      confidence -= 20
      issues.push("Missing payment terms")
    }

    // Cap confidence between 0 and 100
    confidence = Math.max(0, Math.min(100, confidence))

    const extractedQuote: ExtractedQuote = {
      id: quote.id,
      vendor,
      priceUSD,
      deliveryDays,
      terms,
      confidence,
      issues: issues.length > 0 ? issues : undefined,
    }
    return extractedQuote
  })

  return extracted
}

export async function recommendVendor(extractedQuotes: ExtractedQuote[]): Promise<string> {
  // Simulate AI decision delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Only consider quotes with confidence >= 70
  const valid = extractedQuotes.filter((q) => q.confidence >= 70)

  // If none are valid, just return the first ID
  if (valid.length === 0) {
    return extractedQuotes[0]?.id || ""
  }

  // Recommend the valid vendor with lowest price
  let best = valid[0]
  for (const q of valid) {
    if (q.priceUSD < best.priceUSD) {
      best = q
    }
  }
  return best.id
}

export async function draftPO(selectedVendor: ExtractedQuote): Promise<PurchaseOrder> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const poNumber = `PO-${Date.now().toString().slice(-6)}`

  // For demonstration, pack everything into one line item
  const itemQuantity = 100
  const unitPrice = +(selectedVendor.priceUSD / itemQuantity).toFixed(2)

  return {
    id: Math.random().toString(36).substr(2, 9),
    poNumber,
    issueDate: new Date(),
    department: "Manufacturing",
    priority: "Standard",
    vendor: selectedVendor,
    items: [
      {
        id: "item-1",
        description: "Component Package (per extracted quote)",
        quantity: itemQuantity,
        unitPrice,
        total: selectedVendor.priceUSD,
      },
    ],
    specialInstructions:
      "Please ensure all components meet ISO 9001 standards. Deliver to warehouse upon receipt.",
    internalComments: "",
    status: "Draft",
    createdBy: "Demo User",
    version: 1,
  }
}
