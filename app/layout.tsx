import { Manrope } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Launch My MCP — Get Discovered by AI Assistants | Zero-CAC Distribution",
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
    title: "Launch My MCP — Let AI Find Your Product",
    description:
      "Turn your API into a hosted MCP server. Get discovered by Claude, ChatGPT, and Perplexity. Free to start.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Launch My MCP — AI-Native Distribution for SaaS",
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
      suppressHydrationWarning
      className={cn(
        "antialiased",
        manrope.variable,
        GeistMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
