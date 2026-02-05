const OTX_API_KEY = process.env.ALIENVAULT_OTX_API_KEY || ""
const BASE_URL = "https://otx.alienvault.com/api/v1";

// Interfaces
interface OTXPulse {
    id: string;
    name: string;
    description: string;
    author_name: string;
    created: string;
    modified: string;
    tags: string[];
    adversary: string;
    targeted_countries: string[];
    attack_ids: { id: string; name: string }[];
    references: string[];
    indicator_count: number;
}

interface OTXIndicatorIPv4General {
    whois: string;
    reputation: number;
    indicator: string;
    type: string;
    type_title: string;
    base_indicator: {
        id: number;
        indicator: string;
        type: string;
        title: string;
        description: string;
        content: string;
        access_type: string;
        access_reason: string;
    };
    pulse_info: {
        count: number;
        pulses: OTXPulse[];
        references: string[];
        related: {
        alienvault: { adversary: string[]; malware_families: string[]; industries: string[] };
        other: { adversary: string[]; malware_families: string[]; industries: string[] };
        };
    };
    false_positive: unknown[];
    validation: unknown[];
    asn: string;
    city_data: boolean;
    city: string | null;
    region: string | null;
    continent_code: string;
    country_code: string;
    country_code3: string;
    country_name: string;
    postal_code: string | null;
    latitude: number;
    longitude: number;
    accuracy_radius: number;
    subdivision: string | null;
    sections: string[];
}

interface OTXSubscribedPulse {
    id: string;
    name: string;
    description: string;
    author_name: string;
    created: string;
    modified: string;
    tags: string[];
    adversary: string;
    targeted_countries: string[];
    indicators: {
        id: number;
        indicator: string;
        type: string;
        title: string;
        description: string;
        content: string;
        is_active: number;
        created: string;
    }[];
    references: string[];
}

interface OTXSubscribedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OTXSubscribedPulse[];
}

/**
 * Fetch recent pulses the user is subscribed to.
 * These are community threat indicators from the OTX network.
 */
export async function fetchSubscribedPulses(
    limit = 20,
    page = 1
): Promise<OTXSubscribedPulse[]> {
    if(!OTX_API_KEY) return [];

    try {
        const res = await fetch(
            `${BASE_URL}/pulses/subscribed?limit=${limit}&page=${page}`,
            {
                headers: {
                    "X-OTX-API-KEY": OTX_API_KEY,
                    Accept: "application/json",
                },
                next: { revalidate: 120 },
            }
        );

        if(!res.ok) {
            console.error("AlienVault OTX subscribed pulses error: ", res.status);
            return [];
        }

        const json: OTXSubscribedResponse = await res.json();
        return json.results || [];
    } catch (error) {
        console.error("AlienVault OTX subscribed pulses fetch failed: ", error);
        return [];
    }
}

/**
 * Fetch general reputation data for a specific IPv4 address.
 */
export async function getIPv4General(
    ip: string
): Promise<OTXIndicatorIPv4General | null> {
    if(!OTX_API_KEY) return null;
    
    try {
        const res = await fetch(
            `${BASE_URL}/indicators/IPv4/${encodeURIComponent(ip)}/general`,
            {
                headers: {
                    "X-OTX-API-KEY": OTX_API_KEY,
                    Accept: "application/json"
                },
                next: { revalidate: 60 }
            }
        );

        if(!res.ok) {
            console.error("AlienVault OTX IPv4 general error: ", res.status);
            return null;
        }

        return (await res.json()) as OTXIndicatorIPv4General;
    } catch (error) {
        console.error("AlienVault OTX IPv4 general fetch failed: ", error);
        return null;
    }
}