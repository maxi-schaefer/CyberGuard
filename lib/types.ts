export interface ThreatEvent {
    id: string;
    ip: string;
    country: string;
    countryCode: string;
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    source: "AbuseIPDB" | "AlienVault OTX" | "VirusTotal";
    timestamp: string;
    description: string;
    confidence: number;
}

export interface ThreatStats {
    totalThreats: number;
    activeSources: number;
    blockedIPs: number;
    avgConfidence: number;
}

export interface SeverityCounts {
    critical: number;
    high: number;
    medium: number;
    low: number;
}

export interface TimelineEntry {
    time: string;
    threats: number;
    critical: number;
    high: number;
    medium: number;
}

export interface CountryEntry {
    country: string;
    count: number;
}

export interface AttackTypeEntry {
    type: string;
    count: number;
}

export interface SourceStatus {
    name: string;
    status: "online" | "offline" | "degraded";
    count: number;
}

export interface ThreatData {
    events: ThreatEvent[];
    stats: ThreatStats;
    severityCounts: SeverityCounts;
    sourceCounts: Record<string, number>;
    timelineData: TimelineEntry[];
    topCountries: CountryEntry[];
    topAttackTypes: AttackTypeEntry[];
    sourceStatuses: SourceStatus[];
    lastUpdated: string;
}