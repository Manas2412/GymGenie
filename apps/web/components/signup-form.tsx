"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    })
    const [validationError, setValidationError] = useState<string | null>(null)

    const signupMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signup`, data)
            return response.data
        },
        onSuccess: () => {
            router.push("/signin")
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value
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

    const error = validationError || (signupMutation.error as any)?.response?.data?.message || signupMutation.error?.message

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 shadow-xl border-none ring-1 ring-border/50 bg-white text-black">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={handleSignup} className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center mb-4">
                                <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                                <p className="text-sm text-balance text-muted-foreground">
                                    Enter your details below to join GymGenie
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="Manas"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Sisodia"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </Field>
                            </div>
                            <FieldDescription className="-mt-3">
                                Must be at least 8 characters long.
                            </FieldDescription>

                            {error && (
                                <div className="text-sm font-medium text-destructive px-1">
                                    {error}
                                </div>
                            )}

                            <Field>
                                <Button disabled={signupMutation.isPending} type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]">
                                    {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </Field>

                            <FieldDescription className="text-center mt-2">
                                Already have an account? <a href="/signin" className="underline underline-offset-4 hover:text-primary transition-colors">Sign in</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-muted md:block overflow-hidden">
                        <img
                            src="/auth-side.jpg"
                            alt="Gym Interior"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105 dark:brightness-[0.4] brightness-[0.9]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                    </div>
                </CardContent>
            </Card>
            {/* <FieldDescription className="px-6 text-center text-xs opacity-70 text-zinc-400">
                By clicking continue, you agree to our <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{" "}
                and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </FieldDescription> */}
        </div>
    )
}
