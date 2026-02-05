const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY || "";
const BASE_URL = "https://www.virustotal.com/api/v3";

// Interfaces
interface VTIPAttributes {
    as_owner: string;
    asn: number;
    continent: string;
    country: string;
    jarm: string;
    last_analysis_date: number;
    last_analysis_results: Record<
        string,
        {
            category: string;
            result: string;
            method: string;
            engine_name: string;
        }
    >;
    last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
        timeout: number;
    };
    last_https_certificate: unknown;
    last_https_certificate_date: number;
    last_modification_date: number;
    network: string;
    regional_internet_registry: string;
    reputation: number;
    tags: string[];
    total_votes: {
        harmless: number;
        malicious: number;
    };
    whois: string;
    whois_date: number;
}

interface VTIPResponse {
    data: {
        type: string;
        id: string;
        links: { self: string };
        attributes: VTIPAttributes;
    };
}

interface VTPopularDomainResolution {
    attributes: {
        date: number;
        host_name: string;
        host_name_last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
        timeout: number;
        };
        ip_address: string;
        ip_address_last_analysis_stats: {
            harmless: number;
            malicious: number;
            suspicious: number;
            undetected: number;
            timeout: number;
        };
        resolver: string;
    };
    type: string;
    id: string;
}

/**
 * Get IP address report from VirusTotal
 */
export async function getIPReport(
    ip: string
): Promise<VTIPAttributes | null> {
    if(!VT_API_KEY) return null;

    try {
        const res = await fetch(
            `${BASE_URL}/ip_addresses/${encodeURIComponent(ip)}`, {
                headers: {
                    "x-apikey": VT_API_KEY,
                    Accept: "application/json"
                },
                next: { revalidate: 60 }
            }
        )

        if(!res.ok) {
            console.error("VirusTotal IP report error: ", res.status);
            return null;
        }

        const json: VTIPResponse = await res.json();
        return json.data?.attributes || null;
    } catch (error) {
        console.error("VirusTotal IP report fetch failed: ", error);
        return null;
    }
}

/**
 * Get related domains (resolutions) for a given IP.
 */
export async function getIPResolutions(
  ip: string,
  limit = 10
): Promise<VTPopularDomainResolution[]> {
    if (!VT_API_KEY) return [];

    try {
        const res = await fetch(
        `${BASE_URL}/ip_addresses/${encodeURIComponent(ip)}/resolutions?limit=${limit}`,
            {
                headers: {
                "x-apikey": VT_API_KEY,
                Accept: "application/json",
                },
                next: { revalidate: 120 },
            }
        );

        if (!res.ok) {
            console.error(`VirusTotal resolutions error: ${res.status}`);
            return [];
        }

        const json = await res.json();
        return json.data || [];
    } catch (err) {
        console.error("VirusTotal resolutions fetch failed:", err);
        return [];
    }
}

export type { VTIPAttributes, VTPopularDomainResolution };