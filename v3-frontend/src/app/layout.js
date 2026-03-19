import { Geist, Geist_Mono } from "next/font/google";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "SentinelReign | Technology Intelligence Platform",
    template: "%s | SentinelReign Intelligence",
  },
  description: "The definitive intelligence platform for cybersecurity, emerging technology, and scientific research. Decrypting the future for engineers and researchers.",
  keywords: ["cybersecurity", "threat intelligence", "artificial intelligence", "tech news", "hacking tutorials", "OSINT", "security research"],
  authors: [{ name: "Syed Abrar" }],
  creator: "Syed Abrar",
  publisher: "SentinelReign",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sentinelreign.com",
    title: "SentinelReign | Technology Intelligence Platform",
    description: "The definitive intelligence platform for cybersecurity, emerging technology, and scientific research.",
    siteName: "SentinelReign",
  },
  twitter: {
    card: "summary_large_image",
    title: "SentinelReign | Technology Intelligence Platform",
    description: "The definitive intelligence platform for cybersecurity, emerging technology, and scientific research.",
    creator: "@sentinelreign",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20"></div>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
