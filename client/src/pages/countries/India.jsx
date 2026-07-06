import CountryPageSEO from '../../components/country/CountryPageSEO';
import CountryHero from '../../components/country/CountryHero';
import CountryIntro from '../../components/country/CountryIntro';
import WhyChooseSection from '../../components/country/WhyChooseSection';
import RegionsSection from '../../components/country/RegionsSection';
import StatesGrid from '../../components/country/StatesGrid';
import CitiesGrid from '../../components/country/CitiesGrid';
import SafetySection from '../../components/country/SafetySection';
import TipsSection from '../../components/country/TipsSection';
import TestimonialsSection from '../../components/country/TestimonialsSection';
import CountryFAQ from '../../components/country/CountryFAQ';
import FutureExpansion from '../../components/country/FutureExpansion';
import FinalCTA from '../../components/country/FinalCTA';
import { indiaData } from '../../data/countries/india';

const India = () => {
  return (
    <>
      <CountryPageSEO
        country={indiaData.country}
        metaTitle={indiaData.metaTitle}
        metaDescription={indiaData.metaDescription}
        canonicalUrl="/dating/india"
        faqs={indiaData.faqs}
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={indiaData.country}
          stats={indiaData.heroStats}
          subtitle="Connect with verified singles across India with verified profiles, cultural understanding, and modern matchmaking."
        />

        <CountryIntro data={indiaData.introduction} />

        <WhyChooseSection
          features={indiaData.whyChooseUs}
          country={indiaData.country}
          subtitle="Experience a platform designed for India’s diverse dating journeys, with safety, verified profiles, and thoughtful compatibility."
        />

        <RegionsSection regions={indiaData.regions} country={indiaData.country} />

        <StatesGrid states={indiaData.states} country={indiaData.country} />

        <CitiesGrid
          cities={indiaData.popularCities}
          country={indiaData.country}
          subtitle="Explore dating lives and local culture across India’s top metros and emerging relationship hubs."
        />

        <SafetySection safetyData={indiaData.safetyGuide} country={indiaData.country} />

        <TipsSection tips={indiaData.datingTips} country={indiaData.country} />

        <TestimonialsSection testimonials={indiaData.testimonials} country={indiaData.country} />

        <CountryFAQ faqs={indiaData.faqs} country={indiaData.country} />

        <FutureExpansion countries={indiaData.futureCountries} />

        <FinalCTA
          country={indiaData.country}
          subtitle="Join one of the fastest-growing verified dating communities in the world."
          buttonText="Start Your India Dating Journey"
        />
      </div>
    </>
  );
};

export default India;
