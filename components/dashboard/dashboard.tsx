"use client";

import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { DashboardHeader } from "./dashboard-header";

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg bg-secondary" />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton className="h-75 rounded-lg bg-secondary lg:col-span-2" />
                <Skeleton className="h-75 rounded-lg bg-secondary" />
            </div>

            <Skeleton className="h-100 rounded-lg bg-secondary" />
        </div>
    )
}

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(false) // For now, later use useSWR and call api
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader lastUpdated={null} isLoading={isLoading} />
        </div>
    )
}