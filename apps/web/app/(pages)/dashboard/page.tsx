import {
  CurrentWeightProgressChart,
  TargetWeightProgressChart,
} from "@/components/dashboard/progress_tracker"
import React from 'react'

const Dashboard = () => {
  return (
    <div>
      <h1>Progress Tracker</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <CurrentWeightProgressChart />
        <TargetWeightProgressChart />
      </div>
    </div>
  )
}

export default Dashboard;