"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/NavBar/nav-main"
import { NavUser } from "@/components/NavBar/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "gymgenie",
    email: "gymgenie@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "GymGenie",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Workout",
      url: "/dashboard/workout",
      icon: Bot,
      items: [
        {
          title: "Today's Workout",
          url: "/dashboard/workout",
        },
        {
          title: "Generate Workout",
          url: "/dashboard/workout",
        },
        {
          title: "All Workout",
          url: "/dashboard/workout",
        },
      ],
    },
    {
      title: "Machines",
      url: "/dashboard/machines",
      icon: BookOpen,

    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: BookOpen,

    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) return null
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user-profile/get-profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  const user = {
    name: profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}` : data.user.name,
    email: profile?.email || data.user.email,
    avatar: data.user.avatar, // Backend doesn't seem to have avatar yet
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
