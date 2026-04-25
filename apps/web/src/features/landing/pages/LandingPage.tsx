import { Nav } from '@/features/landing/components/Nav';
import { Hero } from '@/features/landing/components/Hero';
import { Features } from '@/features/landing/components/Features';
import { Pricing } from '@/features/landing/components/Pricing';
import { Steps } from '@/features/landing/components/Steps';
import { FAQ } from '@/features/landing/components/FAQ';
import { CTA } from '@/features/landing/components/CTA';
import { Footer } from '@/features/landing/components/Footer';

export function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <Pricing />
      <Steps />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
