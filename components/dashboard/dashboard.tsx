"use client";

import { Skeleton } from "../ui/skeleton";
import { DashboardHeader } from "./dashboard-header";
import useSWR from "swr";
import { ThreatData } from "@/lib/types";
import { StatCards } from "./stat-card";
import { ThreatTimeline } from "./threat-timeline";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
    const { data, isLoading } = useSWR<ThreatData>("/api/threats", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader isLoading={isLoading} />

            {isLoading || !data ? (
                <DashboardSkeleton />
            ) :(
                <main className="flex flex-col gap-6 p-6">
                    {/* Stat Cards */}
                    <StatCards stats={data.stats} severityCounts={data.severityCounts} />

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ThreatTimeline data={data.timelineData} />
                        </div>
                    </div>
                </main>
            )}
        </div>
    )
}