import { NextResponse } from "next/server"

export async function POST() {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Return ID of recommended vendor (Thornwell - best price)
  return NextResponse.json({ recommendedId: "2" })
}
