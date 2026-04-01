import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import LiveDemo from "@/components/landing/LiveDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import ProblemSection from "@/components/landing/ProblemSection";
import DiscoveryFeed from "@/components/landing/DiscoveryFeed";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import CTAFooter from "@/components/landing/CTAFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--mcpl-deep)]">
      <Navbar />
      <Hero />
      <LiveDemo />
      <HowItWorks />
      <ProblemSection />
      <DiscoveryFeed />
      <Pricing />
      <FAQ />
      <CTAFooter />
    </main>
  );
}
