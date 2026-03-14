"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Dumbbell } from 'lucide-react'
import { Machine } from '@/types'
import { Button } from "@/components/ui/button"

const CurrentMachines = () => {
    const queryClient = useQueryClient()
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedMachines, setSelectedMachines] = useState<string[]>([])

    const { data, isLoading, isError } = useQuery({
        queryKey: ['machines'],
        queryFn: async () => {
            const token = localStorage.getItem("token")
            if (!token) return null
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/machines/get-machines`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            return response.data
        },
        enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    })

    const deleteMutation = useMutation({
        mutationFn: async (machineIds: string[]) => {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("No token")

            // Delete sequentially or via promise.all
            await Promise.all(
                machineIds.map(id => axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/machines/delete-machine/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }))
            )
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['machines'] })
            setIsDeleting(false)
            setSelectedMachines([])
        }
    })

    const toggleMachine = (id: string) => {
        setSelectedMachines(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id])
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center py-20 text-destructive">
                Failed to load machines. Please try again later.
            </div>
        )
    }

    const machines: Machine[] = data?.machines || []

    if (machines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p>No machines found in your profile.</p>
            </div>
        )
    }

    // Group machines by category
    const groupedMachines = machines.reduce((acc, machine) => {
        const category = machine.category || "Uncategorized"
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category]!.push(machine)
        return acc
    }, {} as Record<string, Machine[]>)

    return (
        <div className="space-y-4 mt-6">
            <div className="flex justify-end gap-2 mb-4">
                {isDeleting ? (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => { setIsDeleting(false); setSelectedMachines([]) }}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={selectedMachines.length === 0 || deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(selectedMachines)}
                        >
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm ({selectedMachines.length})
                        </Button>
                    </>
                ) : (
                    <Button variant="destructive" onClick={() => setIsDeleting(true)}>
                        Delete machines
                    </Button>
                )}
            </div>

            <div className="space-y-8">
                {Object.entries(groupedMachines).map(([category, categoryMachines]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-xl font-semibold tracking-tight border-b pb-2">{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categoryMachines.map((machine) => (
                                <Card
                                    key={machine.machineId}
                                    className={`relative hover:shadow-md transition-all bg-card/50 ${selectedMachines.includes(machine.machineId) ? 'ring-2 ring-destructive' : ''} ${isDeleting ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                                    onClick={() => {
                                        if (isDeleting) toggleMachine(machine.machineId)
                                    }}
                                >
                                    {isDeleting && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 accent-destructive cursor-pointer"
                                                checked={selectedMachines.includes(machine.machineId)}
                                                onChange={() => toggleMachine(machine.machineId)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                                        <CardTitle className={`text-base font-medium leading-none pr-6 ${isDeleting ? 'mr-4' : ''}`}>
                                            {machine.name}
                                        </CardTitle>
                                        {!isDeleting && <Dumbbell className="h-4 w-4 text-muted-foreground opacity-50 absolute top-4 right-4" />}
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <CardDescription className="text-xs font-semibold">
                                            {machine.category}
                                        </CardDescription>
                                    </CardContent>
                                    <CardContent className="p-4 pt-0">
                                        <CardDescription className="text-xs">
                                            {machine.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CurrentMachines