import ContactSection from "@/components/homepage/ContactSection";
import FeaturedRequests from "@/components/homepage/FeaturedRequests";
import Hero from "@/components/homepage/Hero";
import HowItWorks from "@/components/homepage/HowItWorks";
import Stats from "@/components/homepage/Stats";
import WhyDonate from "@/components/homepage/WhyDonate";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />
      <Stats/>
      <HowItWorks/>
      <FeaturedRequests/>
      <WhyDonate/>
      <ContactSection/>
      
      {/* পরবর্তীতে হোমপেজের অন্যান্য সেকশন (যেমন: Featured Section, Contact Us) এখানে বসবে */}
    </main>
  );
}