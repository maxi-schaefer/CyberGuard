"use client";

import { SeverityCounts, ThreatStats } from "@/lib/types";
import { AlertTriangle, Database, ShieldBan, Target } from "lucide-react";
import { Card, CardContent } from "../ui/card";

function SeverityBar({ counts }: { counts: SeverityCounts }) {
    const total = counts.critical + counts.high + counts.medium + counts.low;
    if(total === 0) return null;

    return (
        <div className="flex h-1.5 w-full overflow-hidden rounded-full">
            <div className="bg-destructive transition-all" style={{ width: `${(counts.critical / total) * 100}`}} />
            <div className="bg-warning transition-all" style={{ width: `${(counts.high / total) * 100}`}} />
            <div className="bg-chart-5 transition-all" style={{ width: `${(counts.medium / total) * 100}`}} />
            <div className="bg-success transition-all" style={{ width: `${(counts.low / total) * 100}`}} />
        </div>
    );
}

export function StatCards({
    stats,
    severityCounts,
} : {
    stats: ThreatStats | null;
    severityCounts: SeverityCounts | null
}) {
    const cards = [
        {
            title: "Total Threats",
            value: stats?.totalThreats ?? 0,
            icon: AlertTriangle,
            color: "text-destructive",
            bgColor: "bg-destructive/10",
        },
        {
            title: "Active Sources",
            value: stats?.activeSources ?? 0,
            icon: Database,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Blocked IPs",
            value: stats?.blockedIPs ?? 0,
            icon: ShieldBan,
            color: "text-warning",
            bgColor: "bg-warning/10",
        },
        {
            title: "Avg Confidence",
            value: `${stats?.avgConfidence ?? 0}%`,
            icon: Target,
            color: "text-success",
            bgColor: "bg-success/10",
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">{card.title}</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                                    {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                                </p>
                            </div>

                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {severityCounts && (
                <div className="col-span-2 lg:col-span-4">
                    <div className="flex items-center gap-4">
                        <SeverityBar counts={severityCounts} />
                        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                                Critical {severityCounts.critical}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-2 w-2 rounded-full bg-warning" />
                                High {severityCounts.high}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-2 w-2 rounded-full bg-chart-5" />
                                Med {severityCounts.medium}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                                Low {severityCounts.low}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}