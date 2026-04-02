"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is an MCP server?",
    answer:
      "Think of it as a way for AI assistants (like Claude or ChatGPT) to discover and use your product. When someone asks an AI for help, it can find your product through your MCP server and recommend it — like having a 24/7 salesperson inside every AI assistant.",
  },
  {
    question: "How does AI discovery work?",
    answer:
      "When someone asks an AI assistant a question — like \"find me a good invoicing tool\" — the AI searches for products that can help. If you have an MCP server, your product shows up as a recommendation. The AI uses your product on behalf of the user, no Google search needed.",
  },
  {
    question: "Do I need technical skills?",
    answer:
      "Not at all. Just describe what your product does in plain English and paste your API link. Launch My MCP handles everything else — no coding, no configuration files, no DevOps.",
  },
  {
    question: "What kind of products work with this?",
    answer:
      "Any product with an API — SaaS tools, data services, marketplaces, productivity apps, and more. If your product has an API that returns data, Launch My MCP can make it discoverable by AI assistants.",
  },
  {
    question: "How long does setup take?",
    answer:
      "About 5 minutes. Describe your product, connect your API, review the AI-generated setup, and hit deploy. We handle hosting, monitoring, and getting you listed in AI registries automatically.",
  },
  {
    question: "Which AI assistants will find my product?",
    answer:
      "Claude, ChatGPT, Cursor, Perplexity, and any AI assistant that supports the MCP standard — which is growing fast. It's an open standard, so as more AI tools adopt it, your reach grows automatically.",
  },
  {
    question: "What if my product's API goes down?",
    answer:
      "We monitor your API around the clock and alert you right away if something goes wrong. AI assistants will see a friendly \"temporarily unavailable\" message instead of an error, so your reputation stays intact.",
  },
  {
    question: "Is my API key safe?",
    answer:
      "Absolutely. Your credentials are encrypted with bank-grade security (AES-256) and never stored in plain text. They're only used at the exact moment an AI needs to call your API, then immediately secured again.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-24 md:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-16">
          {/* Left: headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Questions?{" "}
              <span className="text-muted-foreground">We&apos;ve got answers.</span>
            </h2>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
          <Accordion
            type="single"
            collapsible
            className="border-border/60 bg-card/50"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/40 px-2 data-open:bg-transparent"
              >
                <AccordionTrigger className="py-4 text-sm font-medium text-foreground hover:no-underline hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
        </div>
      </div>
    </section>
  )
}
