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
import { franceData } from '../../data/countries/countriesData';

const France = () => {
  return (
    <>
      <CountryPageSEO
        country={ franceData.country }
        metaTitle={ franceData.metaTitle }
        metaDescription={ franceData.metaDescription }
        canonicalUrl={ `"/dating/${ franceData.slug }"` }
        faqs={ franceData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ franceData.country }
          stats={ franceData.heroStats }
        />

        <CountryIntro data={ franceData.introduction } />

        <WhyChooseSection
          features={ franceData.whyChooseUs }
          country={ franceData.country }
        />

        <RegionsSection regions={ franceData.regions } country={ franceData.country } />

        <StatesGrid states={ franceData.states } country={ franceData.country } />

        <CitiesGrid
          cities={ franceData.popularCities }
          country={ franceData.country }
        />

        <SafetySection safetyData={ franceData.safetyGuide } country={ franceData.country } />

        <TipsSection tips={ franceData.datingTips } country={ franceData.country } />

        <TestimonialsSection testimonials={ franceData.testimonials } country={ franceData.country } />

        <CountryFAQ faqs={ franceData.faqs } country={ franceData.country } />

        <FutureExpansion countries={ franceData.futureCountries } />

        <FinalCTA country={ franceData.country } />
      </div>
    </>
  );
};

export default France;
