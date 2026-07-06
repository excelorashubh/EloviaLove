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
import { brazilData } from '../../data/countries/countriesData';

const Brazil = () => {
  return (
    <>
      <CountryPageSEO
        country={ brazilData.country }
        metaTitle={ brazilData.metaTitle }
        metaDescription={ brazilData.metaDescription }
        canonicalUrl={ `"/dating/${ brazilData.slug }"` }
        faqs={ brazilData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ brazilData.country }
          stats={ brazilData.heroStats }
        />

        <CountryIntro data={ brazilData.introduction } />

        <WhyChooseSection
          features={ brazilData.whyChooseUs }
          country={ brazilData.country }
        />

        <RegionsSection regions={ brazilData.regions } country={ brazilData.country } />

        <StatesGrid states={ brazilData.states } country={ brazilData.country } />

        <CitiesGrid
          cities={ brazilData.popularCities }
          country={ brazilData.country }
        />

        <SafetySection safetyData={ brazilData.safetyGuide } country={ brazilData.country } />

        <TipsSection tips={ brazilData.datingTips } country={ brazilData.country } />

        <TestimonialsSection testimonials={ brazilData.testimonials } country={ brazilData.country } />

        <CountryFAQ faqs={ brazilData.faqs } country={ brazilData.country } />

        <FutureExpansion countries={ brazilData.futureCountries } />

        <FinalCTA country={ brazilData.country } />
      </div>
    </>
  );
};

export default Brazil;
