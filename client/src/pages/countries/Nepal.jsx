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
import { nepalData } from '../../data/countries/countriesData';

const Nepal = () => {
  return (
    <>
      <CountryPageSEO
        country={ nepalData.country }
        metaTitle={ nepalData.metaTitle }
        metaDescription={ nepalData.metaDescription }
        canonicalUrl={ `"/dating/${ nepalData.slug }"` }
        faqs={ nepalData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ nepalData.country }
          stats={ nepalData.heroStats }
        />

        <CountryIntro data={ nepalData.introduction } />

        <WhyChooseSection
          features={ nepalData.whyChooseUs }
          country={ nepalData.country }
        />

        <RegionsSection regions={ nepalData.regions } country={ nepalData.country } />

        <StatesGrid states={ nepalData.states } country={ nepalData.country } />

        <CitiesGrid
          cities={ nepalData.popularCities }
          country={ nepalData.country }
        />

        <SafetySection safetyData={ nepalData.safetyGuide } country={ nepalData.country } />

        <TipsSection tips={ nepalData.datingTips } country={ nepalData.country } />

        <TestimonialsSection testimonials={ nepalData.testimonials } country={ nepalData.country } />

        <CountryFAQ faqs={ nepalData.faqs } country={ nepalData.country } />

        <FutureExpansion countries={ nepalData.futureCountries } />

        <FinalCTA country={ nepalData.country } />
      </div>
    </>
  );
};

export default Nepal;
