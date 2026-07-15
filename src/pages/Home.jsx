import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ThemeToggle from '../components/layout/ThemeToggle';
import Hero from '../components/home/Hero';
import LogoStrip from '../components/home/LogoStrip';
import StepsSection from '../components/home/StepsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Testimonial from '../components/home/Testimonial';
import StartBuildingCTA from '../components/home/StartBuildingCTA';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToId) {
      const element = document.getElementById(location.state.scrollToId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          // Clear history state to avoid scrolling on subsequent refreshes/re-renders
          window.history.replaceState({}, document.title);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  return (
    <div className="home-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Hero />
        <LogoStrip />
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
