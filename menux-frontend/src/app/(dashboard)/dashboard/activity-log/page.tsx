"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIVITY_LOGS = [
  { id: 1, actor: "Owner", action: "Created role: Captain", time: "2 mins ago" },
  { id: 2, actor: "Captain", action: "Updated order ORD-1002 to COOKING", time: "10 mins ago" },
  { id: 3, actor: "Owner", action: "Added user: ravi@restaurant.com", time: "35 mins ago" },
  { id: 4, actor: "Captain", action: "Marked table T-03 as occupied", time: "1 hour ago" },
];

export default function ActivityLogPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <p className="text-sm text-gray-600">Track sensitive actions across the dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ACTIVITY_LOGS.map((log) => (
            <div key={log.id} className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-900">{log.action}</p>
              <p className="text-xs text-gray-500 mt-1">
                {log.actor} • {log.time}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
