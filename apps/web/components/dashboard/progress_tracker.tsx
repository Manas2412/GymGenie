"use client"

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
}: {
  seriesKey: ChartSeriesKey
  title: string
  description: string
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

  const chartData =
    data?.weightProgress?.map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      currentWeight: parseWeight(p.currentWeight),
      targetWeight: parseWeight(p.targetWeight),
    })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
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

export function CurrentWeightProgressChart() {
  return (
    <WeightProgressChart
      seriesKey="currentWeight"
      title="Current Weight Progress"
      description="Current weight over time"
    />
  )
}

export function TargetWeightProgressChart() {
  return (
    <WeightProgressChart
      seriesKey="targetWeight"
      title="Target Weight Progress"
      description="Target weight over time"
    />
  )
}

// Backward compatible export (if other imports still use ProgressChart)
export const ProgressChart = CurrentWeightProgressChart
