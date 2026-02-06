import { TimelineEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer } from "../ui/chart";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const chartConfig = {
    critical: { label: "Critical", color: "hsl(0, 72%, 55%)" },
    high: { label: "High", color: "hsl(38, 92%, 50%)" },
    medium: { label: "Medium", color: "hsl(210, 60%, 55%)" }
}

export function ThreatTimeline({ data }: { data: TimelineEntry[] }) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-foreground">
                        Thread Activity (24h)
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                            Critical
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-warning" />
                            High
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-chart-5" />
                            Medium
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <ChartContainer config={chartConfig} className="h-55 w-full">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(210, 60%, 55%)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(210, 60%, 55%)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" vertical={false} />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} tickLine={false} axisLine={false} interval={3} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} tickLine={false} axisLine={false} width={30} />
                        <Tooltip contentStyle={{
                                backgroundColor: "hsl(220, 18%, 7%)",
                                border: "1px solid hsl(220, 15%, 14%)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "hsl(210, 20%, 92%)",
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="critical"
                            stroke="hsl(0, 72%, 55%)"
                            fill="url(#criticalGrad)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="high"
                            stroke="hsl(38, 92%, 50%)"
                            fill="url(#highGrad)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="medium"
                            stroke="hsl(210, 60%, 55%)"
                            fill="url(#medGrad)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}