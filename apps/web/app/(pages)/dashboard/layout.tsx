"use client"

import Sidebar from '@/components/side-bar'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
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

    return (
        <Sidebar>
            <div className="text-4xl font-bold p-4">
                Hello, {isLoading ? '...' : profile?.firstName || 'User'}
            </div>
            {children}
        </Sidebar>
    )
}

