import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google'

import "./globals.css";

const _inter = Inter({ subsets: ['latin'] });
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: "CyberGuard - Live Threat Intelligence Dashboard",
    description: "Real-time cyber threat intelligence dashboard aggregating data from AbuseIPDB, AlienVault OTX, and VirusTotal.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
return (
    <html lang="en">
        <body className={`font-sans antialiased dark`}>
            {children}
        </body>
    </html>
);
}
