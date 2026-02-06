// Country code to country name mapping for common codes
const COUNTRY_NAMES: Record<string, string> = {
    US: "United States",
    CN: "China",
    RU: "Russia",
    DE: "Germany",
    NL: "Netherlands",
    FR: "France",
    GB: "United Kingdom",
    BR: "Brazil",
    IN: "India",
    KR: "South Korea",
    JP: "Japan",
    VN: "Vietnam",
    ID: "Indonesia",
    UA: "Ukraine",
    IR: "Iran",
    RO: "Romania",
    BG: "Bulgaria",
    PL: "Poland",
    TR: "Turkey",
    TW: "Taiwan",
    TH: "Thailand",
    AR: "Argentina",
    HK: "Hong Kong",
    SG: "Singapore",
    PK: "Pakistan",
    EG: "Egypt",
    MX: "Mexico",
    CO: "Colombia",
    PH: "Philippines",
    BD: "Bangladesh",
    NG: "Nigeria",
    KP: "North Korea",
    CA: "Canada",
    AU: "Australia",
    IT: "Italy",
    ES: "Spain",
    SE: "Sweden",
    CZ: "Czech Republic",
    ZA: "South Africa",
};

function getCountryName(code: string): string {
    return COUNTRY_NAMES[code] || code;
}

function scoreSeverity(
  abuseScore: number
): "critical" | "high" | "medium" | "low" {
    if (abuseScore >= 90) return "critical";
    if (abuseScore >= 70) return "high";
    if (abuseScore >= 40) return "medium";
    return "low";
}

function inferThreatType(tags: string[], name: string): string {
    const lower = [...tags.map((t) => t.toLowerCase()), name.toLowerCase()].join(
        " "
    );
    if (lower.includes("ransomware")) return "Ransomware";
    if (lower.includes("phishing") || lower.includes("credential")) return "Phishing";
    if (lower.includes("malware") || lower.includes("trojan")) return "Malware C2";
    if (lower.includes("botnet") || lower.includes("bot")) return "Botnet Activity";
    if (lower.includes("ddos") || lower.includes("dos")) return "DDoS Attack";
    if (lower.includes("brute") || lower.includes("credential")) return "Brute Force";
    if (lower.includes("scan") || lower.includes("recon")) return "Port Scan";
    if (lower.includes("exploit") || lower.includes("cve")) return "Exploit Attempt";
    if (lower.includes("c2") || lower.includes("command and control")) return "Malware C2";
    if (lower.includes("apt") || lower.includes("espionage")) return "APT Activity";
    if (lower.includes("crypto") || lower.includes("mining")) return "Cryptojacking";
    if (lower.includes("exfil")) return "Data Exfiltration";
    if (lower.includes("spam")) return "Spam";
    return "Suspicious Activity";
}

function inferSeverity(
    tags: string[],
    name: string
): "critical" | "high" | "medium" | "low" {
    const lower = [...tags.map((t) => t.toLowerCase()), name.toLowerCase()].join(
        " "
    );
    if (
        lower.includes("ransomware") ||
        lower.includes("apt") ||
        lower.includes("zero-day") ||
        lower.includes("critical")
    )
        return "critical";
    if (
        lower.includes("malware") ||
        lower.includes("exploit") ||
        lower.includes("c2") ||
        lower.includes("trojan")
    )
        return "high";
    if (
        lower.includes("phishing") ||
        lower.includes("brute") ||
        lower.includes("scan")
    )
        return "medium";
    return "low";
}
