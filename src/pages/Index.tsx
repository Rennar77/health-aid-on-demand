import Navbar from "@/components/navigation/navbar"
import HeroSection from "@/components/health/hero-section"
import SymptomChecker from "@/components/health/symptom-checker"
import ClinicFinder from "@/components/health/clinic-finder"
import HealthDashboard from "@/components/health/health-dashboard"
import AuthForm from "@/components/auth/auth-form"
import Footer from "@/components/footer/footer"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HealthDashboard />
      <SymptomChecker />
      <ClinicFinder />
      <AuthForm />
      <Footer />
    </div>
  );
};

export default Index;
