"use client"

import Image from "next/image"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addWeeks } from "date-fns"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState({
        // Step 0: Account
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        // Step 1: Personal Info
        height: "",
        currentWeight: "",
        gender: "Male",
        avgWorkoutMinutes: "",
        workoutDaysPerWeek: "",
        birthDate: "",
        // Step 2: Targets
        goalWeight: "",
        targetDuration: "",
        activityLevel: "Beginner",
        bodyGoals: "WEIGHT_LOSS",
        endDate: ""
    })
    const [validationError, setValidationError] = useState<string | null>(null)

    const signupMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signup`, data, {
                withCredentials: true
            })
            return response.data
        },
        onSuccess: () => {
            setStep(1)
            setValidationError(null)
        }
    })

    const postSignupMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/post-signup`, data, {
                withCredentials: true
            })
            return response.data
        },
        onSuccess: () => {
            router.push("/dashboard")
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        // When targetDuration changes, automatically compute endDate based on "now + duration"
        if (id === "targetDuration") {
            let endDate = ""
            const numeric = parseInt(value, 10)
            if (!Number.isNaN(numeric) && numeric > 0) {
                const target = addWeeks(new Date(), numeric)
                // Format as yyyy-MM-dd for <input type="date">
                endDate = target.toISOString().slice(0, 10)
            }

            setFormData(prev => ({
                ...prev,
                targetDuration: value,
                endDate,
            }))
            return
        }

        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError(null)

        if (formData.password !== formData.confirmPassword) {
            setValidationError("Passwords do not match")
            return
        }

        signupMutation.mutate({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            password: formData.password
        })
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        setStep(2)
    }

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        postSignupMutation.mutate({
            email: formData.email,
            height: formData.height,
            currentWeight: formData.currentWeight,
            gender: formData.gender,
            avgWorkoutMinutes: formData.avgWorkoutMinutes,
            workoutDaysPerWeek: formData.workoutDaysPerWeek,
            birthDate: formData.birthDate,
            goalWeight: formData.goalWeight,
            targetDuration: formData.targetDuration,
            activityLevel: formData.activityLevel,
            bodyGoals: formData.bodyGoals,
            endDate: formData.endDate
        })
    }

    const error = validationError ||
        (signupMutation.error as any)?.response?.data?.message ||
        (postSignupMutation.error as any)?.response?.data?.message ||
        signupMutation.error?.message ||
        postSignupMutation.error?.message

    const isPending = signupMutation.isPending || postSignupMutation.isPending

    const steps = [
        { title: "Account", description: "Basic details" },
        { title: "Personal", description: "Body metrics" },
        { title: "Targets", description: "Your goals" }
    ]

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 shadow-2xl border-none ring-1 ring-border/50 bg-white text-black">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-6 md:p-8 flex flex-col">
                        {/* Progress Stepper */}
                        <div className="flex justify-between mb-8 px-2">
                            {steps.map((s, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                        step === idx ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                                            step > idx ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {step > idx ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                    </div>
                                    <span className={cn("text-[10px] font-medium uppercase tracking-wider", step >= idx ? "text-blue-600" : "text-muted-foreground")}>
                                        {s.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {step === 0 && (
                            <form onSubmit={handleSignup}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center mb-6">
                                        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
                                        <p className="text-sm text-muted-foreground">Join GymGenie to start your transformation</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                                            <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                                            <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                                        </Field>
                                    </div>

                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input id="email" type="email" placeholder="m@example.com" value={formData.email} onChange={handleChange} required />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                                        <Input id="phoneNumber" type="tel" placeholder="1234567890" value={formData.phoneNumber} onChange={handleChange} required />
                                    </Field>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
                                            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                                        </Field>
                                    </div>

                                    {error && <div className="text-sm font-medium text-destructive">{error}</div>}

                                    <Button disabled={isPending} type="submit" className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white font-semibold mt-2">
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                        Continue to Profile
                                    </Button>

                                    <p className="text-center text-sm text-muted-foreground mt-4">
                                        Already have an account? <a href="/signin" className="underline font-medium hover:text-primary">Sign in</a>
                                    </p>
                                </FieldGroup>
                            </form>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleNext}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center mb-6">
                                        <h1 className="text-3xl font-bold tracking-tight">Personal Info</h1>
                                        <p className="text-sm text-muted-foreground">Tell us about your body metrics</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
                                            <Input id="height" type="number" placeholder="180" value={formData.height} onChange={handleChange} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="currentWeight">Weight (kg)</FieldLabel>
                                            <Input id="currentWeight" type="number" placeholder="75" value={formData.currentWeight} onChange={handleChange} required />
                                        </Field>
                                    </div>

                                    <Field>
                                        <FieldLabel>Gender</FieldLabel>
                                        <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="NonBinary">Non-Binary</SelectItem>
                                                <SelectItem value="PreferNotToSay">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="birthDate">Birth Date</FieldLabel>
                                        <Input id="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />
                                    </Field>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="avgWorkoutMinutes">Workout (mins)</FieldLabel>
                                            <Input id="avgWorkoutMinutes" type="number" placeholder="60" value={formData.avgWorkoutMinutes} onChange={handleChange} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="workoutDaysPerWeek">Days/Week</FieldLabel>
                                            <Input id="workoutDaysPerWeek" type="number" placeholder="5" value={formData.workoutDaysPerWeek} onChange={handleChange} required />
                                        </Field>
                                    </div>

                                    <Button type="submit" className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white font-semibold mt-2">
                                        Next: Set Goals <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setStep(0)} className="w-full">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Account
                                    </Button>
                                </FieldGroup>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleFinalSubmit}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center mb-6">
                                        <h1 className="text-3xl font-bold tracking-tight">Set Your Goals</h1>
                                        <p className="text-sm text-muted-foreground">Where do you want to be?</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="goalWeight">Goal Weight (kg)</FieldLabel>
                                            <Input id="goalWeight" type="number" placeholder="70" value={formData.goalWeight} onChange={handleChange} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="targetDuration">Duration (weeks)</FieldLabel>
                                            <Input id="targetDuration" placeholder="12" value={formData.targetDuration} onChange={handleChange} required />
                                        </Field>
                                    </div>

                                    <Field>
                                        <FieldLabel>Activity Level</FieldLabel>
                                        <Select value={formData.activityLevel} onValueChange={(v) => handleSelectChange("activityLevel", v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                                <SelectItem value="Expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field>
                                        <FieldLabel>Primary Body Goal</FieldLabel>
                                        <Select value={formData.bodyGoals} onValueChange={(v) => handleSelectChange("bodyGoals", v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Goal" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                                                <SelectItem value="WEIGHT_GAIN">Weight Gain</SelectItem>
                                                <SelectItem value="MASS_GAIN">Mass Gain</SelectItem>
                                                <SelectItem value="LEAN_MUSCLE_GAIN">Lean Muscle Gain</SelectItem>
                                                <SelectItem value="STRENGTH_GAIN">Strength Gain</SelectItem>
                                                <SelectItem value="ENDURANCE_GAIN">Endurance Gain</SelectItem>
                                                <SelectItem value="BALANCED_GAIN">Balanced Gain</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="endDate">Target End Date</FieldLabel>
                                        <Input id="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                                    </Field>

                                    {error && <div className="text-sm font-medium text-destructive">{error}</div>}

                                    <Button disabled={isPending} type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold mt-2 shadow-lg shadow-green-200">
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        Complete Profile
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Metrics
                                    </Button>
                                </FieldGroup>
                            </form>
                        )}
                    </div>

                    <div className="relative hidden bg-muted md:block overflow-hidden">
                        <Image
                            src={step === 0 ? "/auth-side.jpg" : step === 1 ? "/personal-info.jpg" : "/targets.jpg"}
                            alt="Gym Interior"
                            fill
                            className="absolute inset-0 h-full w-full object-cover transition-all duration-1000 animate-in fade-in zoom-in-95 brightness-[0.8]"
                            priority={step === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <h2 className="text-2xl font-bold mb-2">
                                {step === 0 ? "Start Your Journey" : step === 1 ? "Know Your Body" : "Crush Your Goals"}
                            </h2>
                            <p className="text-sm text-zinc-200">
                                {step === 0 ? "Create an account and get personalized workout plans tailored to your needs." :
                                    step === 1 ? "Accurate metrics help us calculate your caloric needs and workout intensity." :
                                        "Setting clear targets is the first step towards achieving the physique you desire."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
