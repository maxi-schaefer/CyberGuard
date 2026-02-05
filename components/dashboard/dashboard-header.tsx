"use client";

import { Shield, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

export function DashboardHeader({ isLoading }: { isLoading: boolean }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="flex flex-col gap-4 border-b border-bordre px-6 py-4 md:flex-row md:items-center md:justify-between">
            {/* Branding */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">CyberGuard</h1>
                    <p className="text-xs text-muted-foreground">Threat Intelligence Dashboard</p>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    { isLoading ? (
                        <WifiOff className="h-4 w-4 text-muted-foreground animate-pulse" />
                    ) : (
                        <Wifi className="h-4 w-4 text-success animate-pulse" />
                    )}

                    <Badge variant={"outline"} className={isLoading ? "border-muted-foreground/30 text-muted-foreground" : "border-success/30 bg-success/10 text-success"}>
                        {isLoading ? "Syncing..." : "Live"}
                    </Badge>
                </div>

                {/* Threat Intelligence - Colors */}
                <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
                    <div className="flex items-center gap-1 5">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                        <span>AbuseIPDB</span>
                    </div>
                    <div className="flex items-center gap-1 5">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                        <span>AlienVault OTX</span>
                    </div>
                    <div className="flex items-center gap-1 5">
                        <div className="h-2 w-2 rounded-full bg-chart-3 animate-pulse-glow" />
                        <span>VirusTotal</span>
                    </div>
                </div>

                {/* Current Time */}
                <div className="font-mono text-sm tabular-nums text-muted-foreground">
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>

        </header>
    )
}