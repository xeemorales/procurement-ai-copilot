import { NextResponse } from "next/server"

export async function POST() {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const poNumber = `PO-${Date.now().toString().slice(-6)}`

  const mockPO = {
    id: Math.random().toString(36).substr(2, 9),
    poNumber,
    issueDate: new Date().toISOString(),
    department: "Manufacturing",
    priority: "Medium",
    specialInstructions:
      "Please ensure all components meet ISO 9001 standards. Coordinate delivery with our receiving department 24 hours in advance.",
    internalComments: "",
    status: "Draft",
    createdBy: "Demo User",
    version: 1,
  }

  return NextResponse.json(mockPO)
}
