const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY || "";
const BASE_URL = "https://api.abuseipdb.com/api/v2";

// Interfaces
interface AbuseIPDBReport {
    reportedAt: string;
    comment: string;
    categories: number[];
    reporterId: number;
    reporterCountryCode: string;
    reporterCountryName: string;
}

interface AbuseIPDBCheckResponse {
    data: {
        ipAddress: string;
        isPublic: boolean;
        ipVersion: number;
        isWhitelisted: boolean | null;
        abuseConfidenceScore: number;
        countryCode: string;
        countryName: string;
        usageType: string;
        isp: string;
        domain: string;
        hostnames: string[];
        isTor: boolean;
        totalReports: number;
        numDistinctUsers: number;
        lastReportedAt: string | null;
        reports?: AbuseIPDBReport[];
    };
}

interface AbuseIPDBBlacklistEntry {
    ipAddress: string;
    abuseConfidenceScore: number;
    countryCode: string;
    lastReportedAt: string;
}

interface AbuseIPDBBlacklistResponse {
    data: AbuseIPDBBlacklistEntry[];
}

// Category mapping for AbuseIPDB
const CATEGORY_MAP: Record<number, string> = {
    1: "DNS Compromise",
    2: "DNS Poisoning",
    3: "Fraud Orders",
    4: "DDoS Attack",
    5: "FTP Brute Force",
    6: "Ping of Death",
    7: "Phishing",
    8: "Fraud VoIP",
    9: "Open Proxy",
    10: "Web Spam",
    11: "Email Spam",
    12: "Blog Spam",
    13: "VPN IP",
    14: "Port Scan",
    15: "Hacking",
    16: "SQL Injection",
    17: "Email Spoofing",
    18: "Brute Force",
    19: "Bad Web Bot",
    20: "Exploited Host",
    21: "Web App Attack",
    22: "SSH Abuse",
    23: "IoT Targeted",
};

export function getCategoryName(id: number): string {
    return CATEGORY_MAP[id] || `Category ${id}`;
}

/**
 * Fetch the blacklist of most reported IPs from AbuseIPDB.
 * Returns up to `limit` IPs with confidence >= confidenceMinimum.
 */
export async function fetchBlacklist(
    limit = 50,
    confidenceMinimum = 50
): Promise<AbuseIPDBBlacklistEntry[]> {
    if(!ABUSEIPDB_API_KEY) return [];

    try {
        const res = await fetch(
            `${BASE_URL}/blacklist?limi=${limit}&confidenceMinimum=${confidenceMinimum}`,
            {
                headers: {
                    Key: ABUSEIPDB_API_KEY,
                    Accept: "application/json",
                },
                next: { revalidate: 120 },
            }
        );

        if(!res.ok) {
            console.error("AbuseIPDB blacklist error: ", res.status);
            return [];
        }

        const json: AbuseIPDBBlacklistResponse = await res.json();
        return json.data || []; 
    } catch (error) {
        console.error("AbuseIPDB blacklist fetch failed: ", error);
        return []
    }
}

/**
 * Check specific IP address against AbuseIPDB.
 * maxAgeInDays: how far back to look for reports (default 90 days)
 */
export async function checkIP(
    ip: string,
    maxAgeInDays = 90,
): Promise<AbuseIPDBCheckResponse["data"] | null> {
    if(!ABUSEIPDB_API_KEY) return null;

    try {
        const res = await fetch(
            `${BASE_URL}/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=${maxAgeInDays}`,
            {
                headers: {
                    Key: ABUSEIPDB_API_KEY,
                    Accept: "application/json"
                },
                next: { revalidate: 60 }
            }
        );

        if(!res.ok) {
            console.error("AbuseIPDB check error: ", res.status);
            return null;
        }

        const json: AbuseIPDBCheckResponse = await res.json();
        return json.data;
    } catch (error) {
        console.error("AbuseIPDB check failed: ", error);
        return null;
    }
}