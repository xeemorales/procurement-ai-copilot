"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Edit, Check, Send } from "lucide-react"
import ProgressBar from "@/components/ProgressBar"
import { useQuoteStore } from "@/lib/store"
import { draftPO } from "@/lib/ai"
import { useToast } from "@/hooks/use-toast"

export default function POPage() {
  const { selectedVendor, purchaseOrder, setPurchaseOrder, setCurrentStep, addActivityLog } = useQuoteStore()

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setCurrentStep(3)

    if (!selectedVendor) {
      router.push("/compare")
      return
    }

    const generatePO = async () => {
      try {
        if (!purchaseOrder) {
          const po = await draftPO(selectedVendor)
          setPurchaseOrder(po)
        }
      } catch (error) {
        console.error("Error generating PO:", error)
      } finally {
        setLoading(false)
      }
    }

    generatePO()
  }, [selectedVendor, purchaseOrder, setPurchaseOrder, setCurrentStep, router])

  const handleApprove = () => {
    if (purchaseOrder) {
      const updatedPO = { ...purchaseOrder, status: "Approved" as const }
      setPurchaseOrder(updatedPO)
      addActivityLog({
        action: "PO Approved",
        user: "Demo User",
        details: `Approved PO #${purchaseOrder.poNumber}`,
      })
      toast({
        title: "Purchase Order Approved",
        description: `PO #${purchaseOrder.poNumber} has been approved successfully.`,
      })
    }
  }

  const handleSendToVendor = async () => {
    try {
      const response = await fetch("/api/mock/sendPo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poId: purchaseOrder?.id }),
      })

      if (response.ok) {
        addActivityLog({
          action: "PO Sent to Vendor",
          user: "Demo User",
          details: `Sent PO #${purchaseOrder?.poNumber} to ${selectedVendor?.vendor}`,
        })
        toast({
          title: "PO Sent Successfully",
          description: `Purchase order has been sent to ${selectedVendor?.vendor}.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send PO to vendor.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgressBar currentStep={3} totalSteps={3} />
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Purchase Order</h2>
          <p className="text-gray-600">Creating your PO draft...</p>
        </div>
      </div>
    )
  }

  if (!purchaseOrder) {
    return <div>Error: No purchase order data</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-success text-white">Approved</Badge>
      case "Under Review":
        return <Badge className="bg-warning text-white">Under Review</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ProgressBar currentStep={3} totalSteps={3} />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Editor</h2>
          <p className="text-gray-600">Review and approve your purchase order</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Created by {purchaseOrder.createdBy} | v{purchaseOrder.version}
          </div>
          {getStatusBadge(purchaseOrder.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* PO Header */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">PO Number</label>
                  <Input value={purchaseOrder.poNumber} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Issue Date</label>
                  <Input value={purchaseOrder.issueDate.toLocaleDateString()} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Select value={purchaseOrder.department} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={purchaseOrder.priority} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vendor Name</label>
                  <Input value={selectedVendor?.vendor} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Terms</label>
                  <Input value={selectedVendor?.terms} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Expected Delivery</label>
                  <Input value={`${selectedVendor?.deliveryDays} days`} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">AI Confidence</label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-success text-white">{selectedVendor?.confidence}%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Unit Price</th>
                      <th className="text-left p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-2">${item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <div className="text-lg font-bold">
                  Total: ${purchaseOrder.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={purchaseOrder.specialInstructions} disabled={!isEditing} rows={4} />
            </CardContent>
          </Card>

          {/* Internal Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={purchaseOrder.internalComments}
                placeholder="Add internal notes for your team..."
                disabled={!isEditing}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Address */}
          <Card>
            <CardHeader>
              <CardTitle>Ship To Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="font-medium">Meridian Manufacturing</div>
                <div>1234 Industrial Blvd</div>
                <div>Manufacturing City, MC 12345</div>
                <div>United States</div>
              </div>
            </CardContent>
          </Card>

          {/* SAP Integration */}
          <Card>
            <CardHeader>
              <CardTitle>SAP Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                When connected, this PO will be posted to SAP ECC via standard IDoc ORDERS05.
              </p>
              <Button variant="outline" disabled className="w-full">
                Configure SAP Webhook
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </Button>

          <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Revise Information</span>
          </Button>

          {purchaseOrder.status !== "Approved" ? (
            <Button onClick={handleApprove} className="flex items-center space-x-2 bg-success hover:bg-success/90">
              <Check className="h-4 w-4" />
              <span>Approve Purchase Order</span>
            </Button>
          ) : (
            <Button
              onClick={handleSendToVendor}
              className="flex items-center space-x-2 bg-brand-blue hover:bg-brand-blue/90"
            >
              <Send className="h-4 w-4" />
              <span>Send to Vendor</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
