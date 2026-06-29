import CountryPageSEO from '../components/country/CountryPageSEO';
import CountryHero from '../components/country/CountryHero';
import CountryIntro from '../components/country/CountryIntro';
import WhyChooseSection from '../components/country/WhyChooseSection';
import RegionsSection from '../components/country/RegionsSection';
import StatesGrid from '../components/country/StatesGrid';
import CitiesGrid from '../components/country/CitiesGrid';
import SafetySection from '../components/country/SafetySection';
import TipsSection from '../components/country/TipsSection';
import TestimonialsSection from '../components/country/TestimonialsSection';
import CountryFAQ from '../components/country/CountryFAQ';
import FutureExpansion from '../components/country/FutureExpansion';
import FinalCTA from '../components/country/FinalCTA';
import { indiaData } from '../data/countries/india';

const DatingInIndiaPage = () => {
  return (
    <>
      {/* SEO Meta Tags & Schemas */}
      <CountryPageSEO 
        country={indiaData.country}
        metaTitle={indiaData.metaTitle}
        metaDescription={indiaData.metaDescription}
        canonicalUrl="/dating-in-india"
        faqs={indiaData.faqs}
      />

      {/* Page Content */}
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <CountryHero 
          country={indiaData.country}
          stats={indiaData.heroStats}
        />

        {/* Introduction */}
        <CountryIntro data={indiaData.introduction} />

        {/* Why Choose Elovia Love */}
        <WhyChooseSection 
          features={indiaData.whyChooseUs}
          country={indiaData.country}
        />

        {/* Regional Dating Cultures */}
        <RegionsSection 
          regions={indiaData.regions}
          country={indiaData.country}
        />

        {/* Explore States */}
        <StatesGrid 
          states={indiaData.states}
          country={indiaData.country}
        />

        {/* Popular Cities */}
        <CitiesGrid 
          cities={indiaData.popularCities}
          country={indiaData.country}
        />

        {/* Dating Safety */}
        <SafetySection 
          safetyData={indiaData.safetyGuide}
          country={indiaData.country}
        />

        {/* Dating Tips */}
        <TipsSection 
          tips={indiaData.datingTips}
          country={indiaData.country}
        />

        {/* Success Stories */}
        <TestimonialsSection 
          testimonials={indiaData.testimonials}
          country={indiaData.country}
        />

        {/* FAQ */}
        <CountryFAQ 
          faqs={indiaData.faqs}
          country={indiaData.country}
        />

        {/* Future Expansion */}
        <FutureExpansion 
          countries={indiaData.futureCountries}
        />

        {/* Final CTA */}
        <FinalCTA country={indiaData.country} />
      </div>
    </>
  );
};

export default DatingInIndiaPage;
