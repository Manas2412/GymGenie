"use client";

import * as React from "react";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  UpdateProfileInput,
  BackendProfile,
  NormalizedProfile,
  ProfileFormValues,
  Gender,
  ActivityLevel,
  BodyGoals,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format, addWeeks } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function PersonalInfoForm() {
  const queryClient = useQueryClient();
  // 1. Fetch current profile data
  const { data: profile, isLoading: isProfileLoading } =
    useQuery<BackendProfile | null>({
      queryKey: ["get-profile"],
      queryFn: async () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user-profile/get-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return response.data;
      },
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    });

  // 2. Setup Mutation for updates
  const updateProfile = useMutation<unknown, unknown, UpdateProfileInput>({
    mutationKey: ["update-profile"],
    mutationFn: async (data: UpdateProfileInput) => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing auth token");
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user-profile/update-profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["get-profile"] });
    },
  });

  // Flatten profile shape so personalInfo and targets fields are available at top level
  const normalizedProfile = React.useMemo<NormalizedProfile | null>(() => {
    if (!profile) return null;
    const pi = profile.personalInfo ?? {};
    const targetsSource = profile.targets;
    const targets = Array.isArray(targetsSource)
      ? targetsSource.reduce<Record<string, unknown>>((latest, t) => {
          if (!t) return latest;
          const latestDateRaw =
            (latest as { endDate?: unknown; startDate?: unknown }).endDate ??
            (latest as { startDate?: unknown }).startDate ??
            "";
          const nextDateRaw =
            (t as { endDate?: unknown; startDate?: unknown }).endDate ??
            (t as { startDate?: unknown }).startDate ??
            "";

          const latestTs = Date.parse(String(latestDateRaw));
          const nextTs = Date.parse(String(nextDateRaw));

          if (!Number.isFinite(latestTs) && Number.isFinite(nextTs)) return t;
          if (Number.isFinite(latestTs) && Number.isFinite(nextTs))
            return nextTs >= latestTs ? t : latest;
          return latest;
        }, (targetsSource[0] ?? {}) as Record<string, unknown>)
      : (targetsSource ?? {});
    return { ...(profile ?? {}), ...(pi ?? {}), ...(targets ?? {}) };
  }, [profile]);

  const buildDefaultValues = (
    src: NormalizedProfile | null,
  ): ProfileFormValues => {
    const validActivityLevels: ActivityLevel[] = [
      "Newbie",
      "Beginner",
      "Intermediate",
      "Advanced",
      "Expert",
    ];
    const validBodyGoals: BodyGoals[] = [
      "WEIGHT_LOSS",
      "WEIGHT_GAIN",
      "MASS_GAIN",
      "LEAN_MUSCLE_GAIN",
      "STRENGTH_GAIN",
      "ENDURANCE_GAIN",
      "BALANCED_GAIN",
    ];

    const normalizeActivityLevel = (
      raw: NormalizedProfile["activityLevel"],
    ): ActivityLevel | undefined => {
      if (raw === undefined || raw === null) return undefined;
      const trimmed = String(raw).trim();
      return (validActivityLevels as string[]).includes(trimmed)
        ? (trimmed as ActivityLevel)
        : undefined;
    };

    const normalizeBodyGoals = (
      raw: NormalizedProfile["bodyGoals"],
    ): BodyGoals | undefined => {
      if (raw === undefined || raw === null) return undefined;
      const trimmed = String(raw).trim();
      return (validBodyGoals as string[]).includes(trimmed)
        ? (trimmed as BodyGoals)
        : undefined;
    };

    const currentWeightRaw =
      src?.currentWeight === undefined || src?.currentWeight === null
        ? ""
        : String(src.currentWeight).trim();
    const goalWeightRaw =
      src?.goalWeight === undefined || src?.goalWeight === null
        ? ""
        : String(src.goalWeight).trim();

    const currentWeightNum = currentWeightRaw ? Number(currentWeightRaw) : NaN;
    const goalWeightNum = goalWeightRaw ? Number(goalWeightRaw) : NaN;

    const inferredBodyGoal: BodyGoals | undefined =
      Number.isFinite(currentWeightNum) && Number.isFinite(goalWeightNum)
        ? currentWeightNum > goalWeightNum
          ? "WEIGHT_LOSS"
          : currentWeightNum < goalWeightNum
            ? "WEIGHT_GAIN"
            : undefined
        : undefined;

    return {
      email: src?.email ?? "",
      firstName: src?.firstName ?? "",
      lastName: src?.lastName ?? "",
      phoneNumber: src?.phoneNumber ?? "",
      currentPassword: "",
      newPassword: "",
      height: src?.height ?? "",
      currentWeight: src?.currentWeight ?? "",
      gender: (src?.gender as Gender) ?? "Male",
      avgWorkoutMinutes: src?.avgWorkoutMinutes ?? "",
      workoutDaysPerWeek: src?.workoutDaysPerWeek ?? "",
      birthDate: src?.birthDate
        ? format(new Date(src.birthDate), "dd/MM/yyyy")
        : "",
      goalWeight: src?.goalWeight ?? "",
      targetDuration: src?.targetDuration ?? "",
      // Use backend values directly, fall back only if missing
      activityLevel: normalizeActivityLevel(src?.activityLevel) ?? "Beginner",
      bodyGoals:
        normalizeBodyGoals(src?.bodyGoals) ?? inferredBodyGoal ?? "WEIGHT_LOSS",
      endDate: src?.endDate ?? "",
    };
  };

  // Keep an immutable snapshot of the initial values to detect changes
  const initialValuesRef = React.useRef<ProfileFormValues>(
    buildDefaultValues(normalizedProfile),
  );
  const [isEditing, setIsEditing] = React.useState(false);

  // 3. Initialize Form with dynamic default values based on profile
  const form = useForm({
    defaultValues: initialValuesRef.current,
    onSubmit: async ({ value }) => {
      try {
        const submissionData: ProfileFormValues = { ...value };
        // Calculate endDate if targetDuration is provided (weeks)
        if (submissionData.targetDuration) {
          const weeks = parseInt(submissionData.targetDuration);
          if (!isNaN(weeks)) {
            submissionData.endDate = addWeeks(new Date(), weeks).toISOString();
            submissionData.targetDuration = `${weeks} weeks`;
          }
        }

        // Convert birthDate from dd/MM/yyyy to ISO string if present,
        // otherwise remove it so Zod doesn't try to coerce an empty string.
        if (submissionData.birthDate) {
          const raw = String(submissionData.birthDate);
          const [dd, mm, yyyy] = raw.split("/");
          if (dd && mm && yyyy) {
            const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
            if (!Number.isNaN(parsed.getTime())) {
              submissionData.birthDate = parsed.toISOString();
            } else {
              toast.error("Invalid birth date. Please use DD/MM/YYYY.");
              return;
            }
          } else {
            toast.error("Invalid birth date. Please use DD/MM/YYYY.");
            return;
          }
        } else {
          delete submissionData.birthDate;
        }

        // If endDate is still empty, drop it so z.coerce.date doesn't see "".
        if (!submissionData.endDate) {
          delete submissionData.endDate;
        }

        // Drop empty password helpers so backend Zod (min(1)) doesn't see "".
        if (!submissionData.currentPassword) {
          delete submissionData.currentPassword;
        }
        if (!submissionData.newPassword) {
          delete submissionData.newPassword;
        }

        // Password logic: only send password fields when user is trying to change it.
        if (value.currentPassword && value.newPassword) {
          submissionData.currentPassword = value.currentPassword;
          submissionData.newPassword = value.newPassword;
        }

        // Build a backend-safe payload with correct types
        const backendPayload: UpdateProfileInput = {};

        if (submissionData.email !== undefined)
          backendPayload.email = submissionData.email;
        if (submissionData.firstName !== undefined)
          backendPayload.firstName = submissionData.firstName;
        if (submissionData.lastName !== undefined)
          backendPayload.lastName = submissionData.lastName;
        if (submissionData.phoneNumber !== undefined)
          backendPayload.phoneNumber = submissionData.phoneNumber;

        if (submissionData.height !== undefined)
          backendPayload.height = Number(submissionData.height);
        if (submissionData.currentWeight !== undefined)
          backendPayload.currentWeight = Number(submissionData.currentWeight);
        if (submissionData.gender !== undefined && submissionData.gender !== "")
          backendPayload.gender = submissionData.gender as Gender;
        if (submissionData.avgWorkoutMinutes !== undefined)
          backendPayload.avgWorkoutMinutes = Number(
            submissionData.avgWorkoutMinutes,
          );
        if (submissionData.workoutDaysPerWeek !== undefined)
          backendPayload.workoutDaysPerWeek = Number(
            submissionData.workoutDaysPerWeek,
          );

        if (submissionData.birthDate !== undefined)
          backendPayload.birthDate = submissionData.birthDate;

        if (submissionData.goalWeight !== undefined)
          backendPayload.goalWeight = Number(submissionData.goalWeight);
        if (submissionData.targetDuration !== undefined)
          backendPayload.targetDuration = submissionData.targetDuration;
        if (
          submissionData.activityLevel !== undefined &&
          submissionData.activityLevel !== ""
        )
          backendPayload.activityLevel =
            submissionData.activityLevel as ActivityLevel;
        if (
          submissionData.bodyGoals !== undefined &&
          submissionData.bodyGoals !== ""
        )
          backendPayload.bodyGoals = submissionData.bodyGoals as BodyGoals;
        if (
          submissionData.endDate !== undefined &&
          submissionData.endDate !== null
        )
          backendPayload.endDate = String(submissionData.endDate);

        if (submissionData.currentPassword !== undefined)
          backendPayload.currentPassword = submissionData.currentPassword;
        if (submissionData.newPassword !== undefined)
          backendPayload.newPassword = submissionData.newPassword;

        await updateProfile.mutateAsync(backendPayload);
        // After successful save, treat current values as the new "initial" snapshot
        initialValuesRef.current = form.state.values;
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;
        if (message === "Current password incorrect") {
          toast.error("Current password incorrect. Password not updated.");
        } else {
          toast.error("Failed to update profile");
        }
      }
    },
  });

  // Sync form with profile data when it loads / changes
  React.useEffect(() => {
    if (normalizedProfile) {
      const next = buildDefaultValues(normalizedProfile);
      initialValuesRef.current = next;
      form.reset(next);
      setIsEditing(false);
    }
  }, [normalizedProfile, form]);

  if (isProfileLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Personal Information</CardTitle>
        <CardDescription>Update your profile details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <form.Field name="firstName">
            {(field) => (
              <Field>
                <FieldLabel>First Name</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Manas"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
          <form.Field name="lastName">
            {(field) => (
              <Field>
                <FieldLabel>Last Name</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Sisodia"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="example@example.com"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="phoneNumber">
            {(field) => (
              <Field>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="1234567890"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="currentPassword">
            {(field) => (
              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <Input
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter current password to change"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => (
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <Input
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter new password"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="gender">
            {(field) => (
              <Field>
                <FieldLabel>Gender</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as Gender | "")
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="NonBinary">Non-Binary</SelectItem>
                    <SelectItem value="PreferNotToSay">
                      Prefer Not To Say
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="birthDate">
            {(field) => {
              const raw = field.state.value as string | undefined;
              let selectedDate: Date | undefined;
              if (raw) {
                const [dd, mm, yyyy] = raw.split("/");
                if (dd && mm && yyyy) {
                  const parsed = new Date(
                    Number(yyyy),
                    Number(mm) - 1,
                    Number(dd),
                  );
                  if (!Number.isNaN(parsed.getTime())) {
                    selectedDate = parsed;
                  }
                }
              }

              const handleBirthDateChange = (value: string) => {
                // keep only digits, max 8 (ddMMyyyy)
                const digits = value.replace(/\D/g, "").slice(0, 8);
                let formatted = digits;
                if (digits.length > 2 && digits.length <= 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                } else if (digits.length > 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(
                    2,
                    4,
                  )}/${digits.slice(4)}`;
                }
                field.handleChange(formatted);
              };

              return (
                <Field>
                  <FieldLabel>Birth Date (dd/mm/yyyy)</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="DD/MM/YYYY"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="flex-1"
                      disabled={!isEditing}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3"
                          disabled={!isEditing}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) =>
                            field.handleChange(
                              date ? format(date, "dd/MM/yyyy") : "",
                            )
                          }
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>
        </form>
      </CardContent>

      <CardHeader>
        <CardTitle className="text-3xl">Fitness Goals</CardTitle>
        <CardDescription>Update your fitness goals.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form-goals"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <form.Field name="height">
            {(field) => (
              <Field>
                <FieldLabel>Height (cm)</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="180"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="currentWeight">
            {(field) => (
              <Field>
                <FieldLabel>Current Weight (kg)</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="75"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="goalWeight">
            {(field) => (
              <Field>
                <FieldLabel>Goal Weight (kg)</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="70"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="activityLevel">
            {(field) => (
              <Field>
                <FieldLabel>Activity Level</FieldLabel>
                <Select
                  key={`activityLevel:${field.state.value || "empty"}`}
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as ActivityLevel | "")
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Newbie">Newbie</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="bodyGoals">
            {(field) => (
              <Field>
                <FieldLabel>Body Goal</FieldLabel>
                <Select
                  key={`bodyGoals:${field.state.value || "empty"}`}
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as BodyGoals | "")
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                    <SelectItem value="WEIGHT_GAIN">Weight Gain</SelectItem>
                    <SelectItem value="MASS_GAIN">Mass Gain</SelectItem>
                    <SelectItem value="LEAN_MUSCLE_GAIN">
                      Lean Muscle Gain
                    </SelectItem>
                    <SelectItem value="STRENGTH_GAIN">Strength Gain</SelectItem>
                    <SelectItem value="ENDURANCE_GAIN">
                      Endurance Gain
                    </SelectItem>
                    <SelectItem value="BALANCED_GAIN">Balanced Gain</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="avgWorkoutMinutes">
            {(field) => (
              <Field>
                <FieldLabel>Avg Workout (mins)</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="60"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="workoutDaysPerWeek">
            {(field) => (
              <Field>
                <FieldLabel>Workout Days / Week</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="5"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="targetDuration">
            {(field) => (
              <Field>
                <FieldLabel>Target Duration in Week</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="12"
                  disabled={!isEditing}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t mt-4 pt-6">
        {!isEditing ? (
          <Button
            type="button"
            className="ml-auto"
            onClick={() => setIsEditing(true)}
          >
            Update Profile
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset(initialValuesRef.current);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-form"
              disabled={updateProfile.isPending || !isEditing}
            >
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
