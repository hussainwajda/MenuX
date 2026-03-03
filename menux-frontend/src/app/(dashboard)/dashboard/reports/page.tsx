"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-600">Sales and performance insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Today Sales", "₹45,280"],
          ["Avg Ticket", "₹840"],
          ["Completed Orders", "112"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
