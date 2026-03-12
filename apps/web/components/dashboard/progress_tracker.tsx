"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A line chart with a label"

type WeightProgressPoint = {
  currentWeight: string
  targetWeight: string
  createdAt: string
}

type ProgressTrackerResponse = {
  weightProgress: WeightProgressPoint[]
  success: boolean
}

export type FilterRange = "7d" | "1m" | "6m" | "1y" | "all"

const chartConfig = {
  currentWeight: {
    label: "Current Weight",
    color: "hsl(217.2 91.2% 59.8%)",
  },
  targetWeight: {
    label: "Target Weight",
    color: "hsl(0 84.2% 60.2%)",
  },
} satisfies ChartConfig

type ChartSeriesKey = "currentWeight" | "targetWeight"

function parseWeight(value: string): number {
  // Handles both scalar "65" and legacy array-string "{65}" formats.
  const trimmed = value.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(1, -1)
    const first = inner.split(",")[0]?.trim() ?? ""
    return Number(first)
  }
  return Number(trimmed)
}

function WeightProgressChart({
  seriesKey,
  title,
  description,
  range,
}: {
  seriesKey: ChartSeriesKey
  title: string
  description: string
  range: FilterRange
}) {
  const { data } = useQuery({
    queryKey: ["progress-tracker"],
    queryFn: async (): Promise<ProgressTrackerResponse | null> => {
      const token = localStorage.getItem("token")
      if (!token) return null
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dashboard/progress-tracker`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data
    },
  })

  const chartData = React.useMemo(() => {
    if (!data?.weightProgress) return []

    // Map raw points to include Date and day key
    const mapped = data.weightProgress.map((p) => {
      const createdAtDate = new Date(p.createdAt)
      const dayKey = createdAtDate.toISOString().slice(0, 10) // YYYY-MM-DD
      return {
        dayKey,
        createdAt: createdAtDate,
        date: createdAtDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        currentWeight: parseWeight(p.currentWeight),
        targetWeight: parseWeight(p.targetWeight),
      }
    })

    // For each calendar day, keep only the latest point
    const byDay = new Map<string, (typeof mapped)[number]>()
    for (const point of mapped) {
      const existing = byDay.get(point.dayKey)
      if (!existing || point.createdAt > existing.createdAt) {
        byDay.set(point.dayKey, point)
      }
    }

    // Return in chronological order
    return Array.from(byDay.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )
  }, [data])

  const filteredData = React.useMemo(() => {
    if (range === "all" || chartData.length === 0) return chartData

    // Anchor ranges to the latest available data point, not "now",
    // so filters behave consistently with historical data.
    const latest = chartData.reduce((max, p) => {
      const currentMax = max ?? p.createdAt
      return p.createdAt > currentMax ? p.createdAt : currentMax
    }, chartData[0]?.createdAt ?? null)

    if (!latest) return chartData

    const start = new Date(latest)

    switch (range) {
      case "7d":
        start.setDate(start.getDate() - 7)
        break
      case "1m":
        start.setMonth(start.getMonth() - 1)
        break
      case "6m":
        start.setMonth(start.getMonth() - 6)
        break
      case "1y":
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        return chartData
    }

    return chartData.filter((p) => p.createdAt >= start)
  }, [chartData, range])

  return (
    <Card className="shadow-lg bg-[#f3fbfe] dark:bg-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey={seriesKey}
              type="linear"
              stroke={`var(--color-${seriesKey})`}
              strokeWidth={2}
              dot={{
                fill: `var(--color-${seriesKey})`,
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Track your progress <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing {seriesKey === "currentWeight" ? "current" : "target"} weight
          history
        </div>
      </CardFooter>
    </Card>
  )
}

export function CurrentWeightProgressChart({ range }: { range: FilterRange }) {
  return (
    <WeightProgressChart
      seriesKey="currentWeight"
      title="Current Weight Progress"
      description="Current weight over time"
      range={range}
    />
  )
}

export function TargetWeightProgressChart({ range }: { range: FilterRange }) {
  return (
    <WeightProgressChart
      seriesKey="targetWeight"
      title="Target Weight Progress"
      description="Target weight over time"
      range={range}
    />
  )
}

// Backward compatible export (if other imports still use ProgressChart)
export const ProgressChart = CurrentWeightProgressChart
