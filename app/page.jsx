import {
  Navbar,
  HeroSection,
  HowItWorks,
  Features,
  Testimonials,
  Pricing,
  FAQ,
  Footer
} from "@/components/home";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        {/* <Testimonials />
        <Pricing />
        <FAQ /> */}
      </main>
      <Footer />
    </div>
  );
}
