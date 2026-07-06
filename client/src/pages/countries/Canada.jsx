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
import { canadaData } from '../../data/countries/countriesData';

const Canada = () => {
  return (
    <>
      <CountryPageSEO
        country={ canadaData.country }
        metaTitle={ canadaData.metaTitle }
        metaDescription={ canadaData.metaDescription }
        canonicalUrl={ `"/dating/${ canadaData.slug }"` }
        faqs={ canadaData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ canadaData.country }
          stats={ canadaData.heroStats }
        />

        <CountryIntro data={ canadaData.introduction } />

        <WhyChooseSection
          features={ canadaData.whyChooseUs }
          country={ canadaData.country }
        />

        <RegionsSection regions={ canadaData.regions } country={ canadaData.country } />

        <StatesGrid states={ canadaData.states } country={ canadaData.country } />

        <CitiesGrid
          cities={ canadaData.popularCities }
          country={ canadaData.country }
        />

        <SafetySection safetyData={ canadaData.safetyGuide } country={ canadaData.country } />

        <TipsSection tips={ canadaData.datingTips } country={ canadaData.country } />

        <TestimonialsSection testimonials={ canadaData.testimonials } country={ canadaData.country } />

        <CountryFAQ faqs={ canadaData.faqs } country={ canadaData.country } />

        <FutureExpansion countries={ canadaData.futureCountries } />

        <FinalCTA country={ canadaData.country } />
      </div>
    </>
  );
};

export default Canada;
