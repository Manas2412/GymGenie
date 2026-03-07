"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { UpdateProfile } from "@/types"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format, addWeeks } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup, // Kept in case required by other components
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export default function PersonalInfoForm() {
    // 1. Fetch current profile data
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['get-profile'],
        queryFn: async () => {
            const token = localStorage.getItem('token')
            if (!token) return null
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/profile/get-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        }
    })

    // 2. Setup Mutation for updates
    const updateProfile = useMutation({
        mutationKey: ['update-profile'],
        mutationFn: async (data: any) => {
            const token = localStorage.getItem('token')
            if (!token) throw new Error("No token found")
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user-profile/update-profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        }
    })

    // 3. Initialize Form with dynamic default values based on profile
    const form = useForm({
        defaultValues: {
            email: profile?.email,
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            phoneNumber: profile?.phoneNumber,
            currentPassword: "",
            newPassword: "",
            password: "",
            height: profile?.height || "",
            currentWeight: profile?.currentWeight || "",
            gender: (profile?.gender as any) || "Male",
            avgWorkoutMinutes: profile?.avgWorkoutMinutes || "",
            workoutDaysPerWeek: profile?.workoutDaysPerWeek || "",
            birthDate: profile?.birthDate || "",
            goalWeight: profile?.goalWeight || "",
            targetDuration: profile?.targetDuration || "",
            activityLevel: (profile?.activityLevel as any) || "Beginner",
            bodyGoals: (profile?.bodyGoals as any) || "LeanMuscleGain",
            endDate: profile?.endDate || "",
        },
        validators: {
            onSubmit: UpdateProfile as any,
        },
        onSubmit: async ({ value }) => {
            try {
                const submissionData = { ...value };
                // Calculate endDate if targetDuration is provided (weeks)
                if (submissionData.targetDuration) {
                    const weeks = parseInt(submissionData.targetDuration);
                    if (!isNaN(weeks)) {
                        submissionData.endDate = addWeeks(new Date(), weeks).toISOString();
                        submissionData.targetDuration = `${weeks} weeks`;
                    }
                }

                // Password logic
                if (value.currentPassword && value.newPassword) {
                    // Check if current password matches backend password
                    if (value.currentPassword === profile?.password) {
                        submissionData.password = value.newPassword;
                    } else {
                        // If it doesn't match, you might want to show a toast or error
                        // But per your request, we send the original backend password
                        submissionData.password = profile?.password;
                        toast.error("Current password incorrect. Password not updated.");
                    }
                } else {
                    // Default behavior: keep existing password
                    submissionData.password = profile?.password;
                }

                // Clean up helper fields before sending to API
                delete (submissionData as any).currentPassword;
                delete (submissionData as any).newPassword;

                await updateProfile.mutateAsync(submissionData)
                toast.success("Profile updated successfully")
            } catch (error) {
                toast.error("Failed to update profile")
            }
        },
    })

    // Sync form with profile data when it loads
    React.useEffect(() => {
        if (profile) {
            form.reset()
        }
    }, [profile])

    if (isProfileLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-3xl">Personal Information</CardTitle>
                <CardDescription>
                    Update your profile details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="profile-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                    <form.Field
                        name="firstName"
                        children={(field) => (
                            <Field>
                                <FieldLabel>First Name</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="John"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />
                    <form.Field
                        name="lastName"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Last Name</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Doe"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="email"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <Input
                                    type="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="john.doe@example.com"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="phoneNumber"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Phone Number</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="1234567890"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="currentPassword"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Current Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Enter current password to change"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="newPassword"
                        children={(field) => (
                            <Field>
                                <FieldLabel>New Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="gender"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Gender</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="NonBinary">Non-Binary</SelectItem>
                                        <SelectItem value="PreferNotToSay">Prefer Not To Say</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="birthDate"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Birth Date</FieldLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.state.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.state.value ? format(new Date(field.state.value), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.state.value ? new Date(field.state.value) : undefined}
                                            onSelect={(date) => field.handleChange(date?.toISOString() || "")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />
                </form>

            </CardContent>

            <CardHeader>
                <CardTitle className="text-3xl">Fitness Goals</CardTitle>
                <CardDescription>
                    Update your fitness goals.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="profile-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                    <form.Field
                        name="height"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Height (cm)</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="180"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="currentWeight"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Current Weight (kg)</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="75"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="goalWeight"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Goal Weight (kg)</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="70"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="activityLevel"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Activity Level</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select activity level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="bodyGoals"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Body Goal</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select body goal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WeightLoss">Weight Loss</SelectItem>
                                        <SelectItem value="WeightGain">Weight Gain</SelectItem>
                                        <SelectItem value="MassGain">Mass Gain</SelectItem>
                                        <SelectItem value="LeanMuscleGain">Lean Muscle Gain</SelectItem>
                                        <SelectItem value="StrengthGain">Strength Gain</SelectItem>
                                        <SelectItem value="EnduranceGain">Endurance Gain</SelectItem>
                                        <SelectItem value="BalancedGain">Balanced Gain</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="avgWorkoutMinutes"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Avg Workout (mins)</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="60"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="workoutDaysPerWeek"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Workout Days / Week</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="5"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />

                    <form.Field
                        name="targetDuration"
                        children={(field) => (
                            <Field>
                                <FieldLabel>Target Duration in Week</FieldLabel>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="12"
                                />
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    />
                </form>
            </CardContent>

            <CardFooter className="flex justify-between border-t mt-4 pt-6">
                <Button type="button" variant="ghost" onClick={() => form.reset()}>
                    Reset
                </Button>
                <Button
                    type="submit"
                    form="profile-form"
                    disabled={updateProfile.isPending}
                >
                    {updateProfile.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}
