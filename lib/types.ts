export interface Quote {
  id: string
  content: string
  filename?: string
  language: string
  uploadedBy: string
  timestamp: Date
  method: "upload" | "paste"
}

export interface ExtractedQuote {
  id: string
  vendor: string
  priceUSD: number
  deliveryDays: number
  terms: string
  confidence: number
  issues?: string[]
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  issueDate: Date
  department: string
  priority: "Low" | "Medium" | "High"
  vendor: ExtractedQuote
  items: POItem[]
  specialInstructions: string
  internalComments: string
  status: "Draft" | "Under Review" | "Approved"
  createdBy: string
  version: number
}

export interface POItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ActivityLogEntry {
  id: string
  action: string
  timestamp: Date
  user: string
  details?: string
}
