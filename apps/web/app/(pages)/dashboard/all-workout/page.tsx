"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import React, { useState } from "react"
import { format } from "date-fns"
import { Loader2, ChevronDown, ChevronUp, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { GetWorkoutsResponse, WorkoutEntry } from "@/types"

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

function WorkoutCardContent({ workout }: { workout: WorkoutEntry }) {
  return (
    <div className="space-y-4 pt-2">
      <ExerciseList
        title="Chest"
        exercises={workout.chest.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
      />
      <ExerciseList
        title="Shoulders"
        exercises={workout.shoulders.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
      />
      <ExerciseList
        title="Back"
        exercises={workout.back.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
      />
      <div className="space-y-2">
        <ExerciseList
          title="Arms"
          exercises={workout.arms.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
        {workout.arms.map((arm) => {
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
          exercises={workout.legs.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
        />
        {workout.legs.map((leg) => {
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
        exercises={workout.core.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
      />
      <ExerciseList
        title="Cardio"
        exercises={workout.cardio.map((e) => ({ name: e.name, reps: e.reps, sets: e.sets }))}
      />
    </div>
  )
}

const AllWorkout = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-workout"],
    queryFn: async (): Promise<GetWorkoutsResponse | null> => {
      const token = localStorage.getItem("token")
      if (!token) return null
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workout/get-workouts`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  const workouts = data?.userWorkouts ?? []

  const header = (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">All Workouts</h1>
      <Button asChild>
        <Link href="/dashboard/generate-workout">
          <Plus className="mr-2 h-4 w-4" />
          Generate Workout
        </Link>
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {header}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
          Failed to load workouts. Please try again.
        </div>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p className="mt-2">No workouts yet. Generate a workout to see it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {header}
      <div className="space-y-3">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.workoutId} workout={workout} />
        ))}
      </div>
    </div>
  )
}

function WorkoutCard({ workout }: { workout: WorkoutEntry }) {
  const [open, setOpen] = useState(false)
  const dateLabel = format(new Date(workout.createdAt), "EEEE, d MMM yyyy")

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="shadow-sm bg-[#f3fbfe] dark:bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">{dateLabel}</CardTitle>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-expanded={open}
              >
                {open ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <WorkoutCardContent workout={workout} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default AllWorkout
