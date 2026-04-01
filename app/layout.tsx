import { Space_Mono, DM_Sans, JetBrains_Mono } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "MCPLaunch — Get Discovered by AI Assistants | Zero-CAC Distribution",
  description:
    "Turn your API into an MCP server in 5 minutes. Get your product discovered by Claude, ChatGPT, and Perplexity organically. No ads, no engineers, zero customer acquisition cost.",
  keywords: [
    "MCP server",
    "Model Context Protocol",
    "AI discovery",
    "zero CAC",
    "get discovered by Claude",
    "MCP server generator",
    "API to MCP",
    "AI distribution",
    "MCP hosting",
    "Smithery MCP",
  ],
  openGraph: {
    title: "MCPLaunch — Let AI Find Your Product",
    description:
      "Turn your API into a hosted MCP server. Get discovered by Claude, ChatGPT, and Perplexity. Free to start.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPLaunch — AI-Native Distribution for SaaS",
    description:
      "Stop paying for ads. Get your product discovered by AI assistants instead.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark antialiased",
        dmSans.variable,
        jetbrainsMono.variable,
        spaceMono.variable
      )}
    >
      <body>{children}</body>
    </html>
  )
}
