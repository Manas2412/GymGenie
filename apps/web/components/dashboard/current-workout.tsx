"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import React from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetWorkoutsResponse } from "@/types"

function ExerciseList({
  title,
  exercises,
}: {
  title: string
  exercises: { name: string; reps: number; sets: number }[]
}) {
  if (!exercises?.length) return null
  return (
    <div className="space-y-1">
      <h4 className="font-semibold text-sm text-muted-foreground">{title}</h4>
      <ul className="list-disc list-inside space-y-0.5 text-sm">
        {exercises.map((ex, i) => (
          <li key={`${title}-${i}-${ex.name}`}>
            {ex.name} — {ex.sets} × {ex.reps}
          </li>
        ))}
      </ul>
    </div>
  )
}

const CurrentWorkoutPlan = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["current-workout"],
    queryFn: async (): Promise<GetWorkoutsResponse | null> => {
      const token = localStorage.getItem("token")
      if (!token) return null
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workout/get-workouts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  const latestWorkout = data?.userWorkouts?.[0] ?? null

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-[#f3fbfe] dark:bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="shadow-lg bg-[#f3fbfe] dark:bg-card">
        <CardContent className="py-6 text-center text-muted-foreground">
          Something went wrong loading your workout.
        </CardContent>
      </Card>
    )
  }

  if (!latestWorkout) {
    return (
      <Card className="shadow-lg bg-[#f3fbfe] dark:bg-card">
        <CardHeader>
          <CardTitle>Current Workout</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          No workouts yet. Add or generate a workout to see it here.
        </CardContent>
      </Card>
    )
  }

  const createdAtLabel = format(
    new Date(latestWorkout.createdAt),
    "EEEE, d MMM yyyy"
  )

  return (
    <Card className="shadow-lg bg-[#f3fbfe] dark:bg-card">
      <CardHeader className="pb-2">
        <CardTitle>Current Workout</CardTitle>
        <p className="text-sm text-muted-foreground">{createdAtLabel}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExerciseList
          title="Chest"
          exercises={latestWorkout.chest.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
        <ExerciseList
          title="Shoulders"
          exercises={latestWorkout.shoulders.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
        <ExerciseList
          title="Back"
          exercises={latestWorkout.back.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
        <div className="space-y-2">
          <ExerciseList
            title="Arms"
            exercises={latestWorkout.arms.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
          />
          {latestWorkout.arms.map((arm) => {
            const biceps = arm.biceps ?? []
            const triceps = arm.triceps ?? []
            const forearms = arm.forearms ?? []
            if (biceps.length === 0 && triceps.length === 0 && forearms.length === 0)
              return null
            return (
              <div key={arm.armsId} className="ml-4 space-y-1">
                {biceps.length > 0 ? (
                  <ExerciseList title="Biceps" exercises={biceps} />
                ) : null}
                {triceps.length > 0 ? (
                  <ExerciseList title="Triceps" exercises={triceps} />
                ) : null}
                {forearms.length > 0 ? (
                  <ExerciseList title="Forearms" exercises={forearms} />
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="space-y-2">
          <ExerciseList
            title="Legs"
            exercises={latestWorkout.legs.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
          />
          {latestWorkout.legs.map((leg) => {
            const quads = leg.quads ?? []
            const hamstrings = leg.hamstrings ?? []
            const calves = leg.calves ?? []
            if (quads.length === 0 && hamstrings.length === 0 && calves.length === 0)
              return null
            return (
              <div key={leg.legsId} className="ml-4 space-y-1">
                {quads.length > 0 ? (
                  <ExerciseList title="Quads" exercises={quads} />
                ) : null}
                {hamstrings.length > 0 ? (
                  <ExerciseList title="Hamstrings" exercises={hamstrings} />
                ) : null}
                {calves.length > 0 ? (
                  <ExerciseList title="Calves" exercises={calves} />
                ) : null}
              </div>
            )
          })}
        </div>
        <ExerciseList
          title="Core"
          exercises={latestWorkout.core.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
        <ExerciseList
          title="Cardio"
          exercises={latestWorkout.cardio.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
      </CardContent>
    </Card>
  )
}

export default CurrentWorkoutPlan
