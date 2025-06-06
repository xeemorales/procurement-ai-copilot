"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Upload, Brain, UserCheck, Send } from "lucide-react"
import { useQuoteStore } from "@/lib/store"

export default function AuditTimeline() {
  const { activityLog } = useQuoteStore()

  const getIcon = (action: string) => {
    if (action.includes("Quote")) return <Upload className="h-4 w-4" />
    if (action.includes("AI")) return <Brain className="h-4 w-4" />
    if (action.includes("Selected") || action.includes("Approved")) return <UserCheck className="h-4 w-4" />
    if (action.includes("Sent")) return <Send className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes("Approved")) return "bg-success"
    if (action.includes("AI")) return "bg-brand-blue"
    if (action.includes("Selected")) return "bg-warning"
    return "bg-gray-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLog.map((entry, index) => (
            <div key={entry.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${getActionColor(entry.action)} text-white`}>
                {getIcon(entry.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                  <Badge variant="outline" className="text-xs">
                    {entry.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{entry.details}</p>
                <p className="text-xs text-gray-500">by {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
