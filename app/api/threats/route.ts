import { NextResponse } from "next/server";
import { fetchBlacklist } from "@/lib/services/abuseipdb";
import { fetchSubscribedPulses } from "@/lib/services/alientvault";

// Interfaces
interface ThreatEvent {
    id: string;
    ip: string;
    country: string;
    countryCode: string;
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    source: "AbuseIPDB" | "AlienVault" | "VirusTotal";
    timestamp: string;
    description: string;
    confidence: number;
}

interface SourceStatus {
    name: string;
    status: "online" | "offline" | "degraded";
    count: number;
}

export async function GET() {
    const events: ThreatEvent[] = [];
    const sourceStatuses: SourceStatus[] = [];

    // 1. fetch from AbuseIPDB Blacklist
    let abuseCount = 0;
    try {
        const blacklist = await fetchBlacklist(50, 50);
        abuseCount = blacklist.length;

        for(let i = 0; i < blacklist.length; ++i) {
            const entry = blacklist[i];
            const severity = scoreSeverity(entry.abuseConfidenceScore);
            events.push({
                id: `IPDB-${String(i).padStart(5, "0")}`,
                ip: entry.ipAddress,
                country: getCountryName(entry.countryCode || ""),
                countryCode: entry.countryCode || "//",
                type: "Malicious IP",
                severity,
                source: "AbuseIPDB",
                timestamp: entry.lastReportedAt || new Date().toISOString(),
                description: `AbuseIPDB blacklisted IP with ${entry.abuseConfidenceScore}% confidence score`,
                confidence: entry.abuseConfidenceScore
            });
        }

        sourceStatuses.push({
            name: "AbuseIPDB",
            status: "online",
            count: abuseCount
        });
    } catch (error) {
        sourceStatuses.push({ name: "AbuseIPDB", status: "offline", count: 0 });
    }

    // 2. fetch from AlienVault OTX Subscribed Pulses
    let otxCount = 0;
    try {
        const pulses = await fetchSubscribedPulses(20);

        for(const pulse of pulses) {
            // Each pulse can contain multiple indicators - extract IP-based ones
            const ipIndicators = (pulse.indicators || []).filter(
                (ind) => ind.type === "IPv4" || ind.type === "IPv6" || ind.type === "CIDR"
            );

            // If the pulse has IP indicators, create events for them
            if(ipIndicators.length > 0) {
                for(const indicator of ipIndicators.slice(0, 3)) {
                    otxCount++;
                    const tags = pulse.tags || [];
                    const threatType = inferThreatType(tags, pulse.name);
                    events.push({
                        id: `OTX-${pulse.id}-${indicator.id}`,
                        ip: indicator.indicator,
                        country: pulse.targeted_countries?.[0] ? getCountryName(pulse.targeted_countries[0]) : "Unkown",
                        countryCode: pulse.targeted_countries?.[0] || "//",
                        type: threatType,
                        severity: inferSeverity(tags, pulse.name),
                        source: "AlienVault",
                        timestamp: indicator.created || pulse.created,
                        description: pulse.name.slice(0, 120),
                        confidence: Math.min(95, 50 + tags.length * 5)
                    });
                }
            } else {
                // Event without IP indicators, log the pulse as an intelligence event
                otxCount++;
                const tags = pulse.tags || [];
                events.push({
                    id: `OTX-PULSE-${pulse.id}`,
                    ip: "N/A",
                    country: pulse.targeted_countries?.[0] ? getCountryName(pulse.targeted_countries[0]) : "Global",
                    countryCode: pulse.targeted_countries?.[0] || "XX",
                    type: inferThreatType(tags, pulse.name),
                    severity: inferSeverity(tags, pulse.name),
                    source: "AlienVault",
                    timestamp: pulse.created,
                    description: pulse.name.slice(0, 120),
                    confidence: Math.min(90, 40 + tags.length * 5)
                });
            }
        }

        sourceStatuses.push({
            name: "AlienVault",
            status: "online",
            count: otxCount
        });
    } catch (error) {
        sourceStatuses.push({
            name: "AlienVault",
            status: "offline",
            count: 0
        });
    }

    // 3. Virustotal
    const vtAvailable = !!process.env.VIRUSTOTAL_API_KEY;
    sourceStatuses.push({
        name: "VirusTotal",
        status: vtAvailable ? "online" : "offline",
        count: 0
    });

    // Sort all events by timestamp
    events.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Compute statistics
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    const sourceCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    for(const event of events) {
        severityCounts[event.severity]++;
        sourceCounts[event.source] = (sourceCounts[event.source] || 0) + 1;
        typeCounts[event.type] =(typeCounts[event.type] || 0) + 1;
        if(event.country !== "Unkown" && event.country !== "Global") {
            countryCounts[event.country] = (countryCounts[event.country] || 0) + 1;
        }
    }

    // Build timeline from events (group by hour)
    const timelineMap = new Map<string, { threats: number; critical: number; high: number; medium: number }>();
    for(let i = 23; i >= 0; --i) {
        const hour = new Date(Date.now() - i * 3600000);
        const key = hour.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        timelineMap.set(key, { threats: 0, critical: 0, high: 0, medium: 0 });
    }

    for (const event of events) {
        const d = new Date(event.timestamp);
        const diff = Date.now() - d.getTime();
        if (diff < 24 * 3600000) {
            const key = d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            // Find the closest hour bucket
            for (const [bucketKey, bucketVal] of timelineMap.entries()) {
                const bucketHour = Number.parseInt(bucketKey.split(":")[0], 10);
                const eventHour = d.getHours();
                if (bucketHour === eventHour) {
                bucketVal.threats++;
                if (event.severity === "critical") bucketVal.critical++;
                if (event.severity === "high") bucketVal.high++;
                if (event.severity === "medium") bucketVal.medium++;
                break;
                }
            }
        }
    }

    const timelineData = Array.from(timelineMap.entries()).map(
        ([time, data]) => ({
            time,
            ...data
        })
    );

    const topCountries = Object.entries(countryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([country, count]) => ({ country, count }));

    const topAttackTypes = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([type, count]) => ({ type, count }));

    const uniqueIPs = new Set(events.map((e) => e.ip).filter((ip) => ip !== "N/A"));

    return NextResponse.json({
        events,
        stats: {
        totalThreats: events.length,
        activeSources: sourceStatuses.filter((s) => s.status === "online").length,
        blockedIPs: uniqueIPs.size,
        avgConfidence:
            events.length > 0
            ? Math.round(
                    events.reduce((a, b) => a + b.confidence, 0) / events.length
                )
            : 0,
        },
        severityCounts,
        sourceCounts,
        timelineData,
        topCountries,
        topAttackTypes,
        sourceStatuses,
        lastUpdated: new Date().toISOString(),
    });
}