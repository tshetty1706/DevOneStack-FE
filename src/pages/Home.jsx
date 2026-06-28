import React, { useEffect } from 'react';
import Lenis from 'lenis';

// Layout components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ThemeToggle from '../components/layout/ThemeToggle';

// Home section components
import Hero from '../components/home/Hero';
import LogoStrip from '../components/home/LogoStrip';
import StatsSection from '../components/home/StatsSection';
import StepsSection from '../components/home/StepsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import StartBuildingCTA from '../components/home/StartBuildingCTA';

export default function Home() {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Clean up on component unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main style={{ flex: 1 }}>
        <Hero />
        <LogoStrip />
        <StatsSection />
        <StepsSection />
        <FeaturesSection />
        <StartBuildingCTA />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Theme Toggle (Render style) */}
      <ThemeToggle />
    </div>
  );
}
