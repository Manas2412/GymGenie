'use client'
import React from "react"
import {
  CurrentWeightProgressChart,
  TargetWeightProgressChart,
  type FilterRange,
} from "@/components/dashboard/progress_tracker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Dashboard = () => {
  const [range, setRange] = React.useState<FilterRange>("all")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progress Tracker</h1>
        <Select
          value={range}
          onValueChange={(value) => setRange(value as FilterRange)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="1m">Last 1 month</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="1y">Last 1 year</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CurrentWeightProgressChart range={range} />
        <TargetWeightProgressChart range={range} />
      </div>
    </div>
  )
}

export default Dashboard;