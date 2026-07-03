import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ThemeToggle from '../components/layout/ThemeToggle';
import Hero from '../components/home/Hero';
import LogoStrip from '../components/home/LogoStrip';
import StatsSection from '../components/home/StatsSection';
import StepsSection from '../components/home/StepsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Testimonial from '../components/home/Testimonial';
import StartBuildingCTA from '../components/home/StartBuildingCTA';

export default function Home() {
  return (
    <div className="home-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <Hero />
        <LogoStrip />
        <StatsSection />
        <StepsSection />
        <FeaturesSection />
        <Testimonial />
        <StartBuildingCTA />
      </main>

      <Footer />
      <ThemeToggle />
    </div>
  );
}
