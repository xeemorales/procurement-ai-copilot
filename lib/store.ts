import { create } from "zustand"
import type { Quote, ExtractedQuote, PurchaseOrder, ActivityLogEntry } from "./types"

interface QuoteStore {
  quotes: Quote[]
  extractedQuotes: ExtractedQuote[]
  selectedVendor: ExtractedQuote | null
  purchaseOrder: PurchaseOrder | null
  activityLog: ActivityLogEntry[]
  currentStep: number

  // Actions
  addQuote: (quote: Quote) => void
  removeQuote: (id: string) => void
  setExtractedQuotes: (quotes: ExtractedQuote[]) => void
  selectVendor: (vendor: ExtractedQuote) => void
  setPurchaseOrder: (po: PurchaseOrder) => void
  addActivityLog: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void
  setCurrentStep: (step: number) => void
  reset: () => void
  loadDemoData: () => void
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: [],
  extractedQuotes: [],
  selectedVendor: null,
  purchaseOrder: null,
  activityLog: [],
  currentStep: 1,

  addQuote: (quote) => {
    set((state) => ({
      quotes: [...state.quotes, quote],
    }))
    get().addActivityLog({
      action: "Quote Added",
      user: "Demo User",
      details: `${quote.method === "upload" ? "Uploaded" : "Pasted"} quote from ${quote.filename || "text input"}`,
    })
  },

  removeQuote: (id) => {
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== id),
    }))
  },

  setExtractedQuotes: (quotes) => {
    set({ extractedQuotes: quotes })
    get().addActivityLog({
      action: "AI Analysis Complete",
      user: "System",
      details: `Analyzed ${quotes.length} quotes`,
    })
  },

  selectVendor: (vendor) => {
    set({ selectedVendor: vendor })
    get().addActivityLog({
      action: "Vendor Selected",
      user: "Demo User",
      details: `Selected ${vendor.vendor} - $${vendor.priceUSD}`,
    })
  },

  setPurchaseOrder: (po) => {
    set({ purchaseOrder: po })
    get().addActivityLog({
      action: "PO Generated",
      user: "System",
      details: `Generated PO #${po.poNumber}`,
    })
  },

  addActivityLog: (entry) => {
    set((state) => ({
      activityLog: [
        ...state.activityLog,
        {
          ...entry,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
      ],
    }))
  },

  setCurrentStep: (step) => {
    set({ currentStep: step })
  },

  reset: () => {
    set({
      quotes: [],
      extractedQuotes: [],
      selectedVendor: null,
      purchaseOrder: null,
      activityLog: [],
      currentStep: 1,
    })
  },

  loadDemoData: () => {
    const demoQuotes: Quote[] = [
      {
        id: "1",
        content:
          "AlphaTech Solutions\nQuote #AT-2024-001\nSteel Components Package\nQuantity: 500 units\nUnit Price: $45.00\nTotal: $22,500.00\nDelivery: 14 business days\nTerms: Net 30\nValid until: March 15, 2024",
        filename: "alphatech_quote.txt",
        language: "English",
        uploadedBy: "Demo User",
        timestamp: new Date(),
        method: "upload",
      },
      {
        id: "2",
        content:
          "Thornwell Manufacturing\nRFQ Response #TM-2024-156\nSteel Components - Premium Grade\nQty: 500 pcs\nPrice per unit: $42.50\nSubtotal: $21,250.00\nShipping: $750.00\nTotal: $22,000.00\nLead time: 21 days\nPayment: 2/10 Net 30",
        filename: "thornwell_quote.txt",
        language: "English",
        uploadedBy: "Demo User",
        timestamp: new Date(),
        method: "upload",
      },
    ]

    set({ quotes: demoQuotes })
    demoQuotes.forEach((quote) => {
      get().addActivityLog({
        action: "Demo Quote Loaded",
        user: "System",
        details: `Loaded ${quote.filename}`,
      })
    })
  },
}))
