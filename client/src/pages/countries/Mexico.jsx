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
import { mexicoData } from '../../data/countries/countriesData';

const Mexico = () => {
  return (
    <>
      <CountryPageSEO
        country={ mexicoData.country }
        metaTitle={ mexicoData.metaTitle }
        metaDescription={ mexicoData.metaDescription }
        canonicalUrl={ `"/dating/${ mexicoData.slug }"` }
        faqs={ mexicoData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ mexicoData.country }
          stats={ mexicoData.heroStats }
        />

        <CountryIntro data={ mexicoData.introduction } />

        <WhyChooseSection
          features={ mexicoData.whyChooseUs }
          country={ mexicoData.country }
        />

        <RegionsSection regions={ mexicoData.regions } country={ mexicoData.country } />

        <StatesGrid states={ mexicoData.states } country={ mexicoData.country } />

        <CitiesGrid
          cities={ mexicoData.popularCities }
          country={ mexicoData.country }
        />

        <SafetySection safetyData={ mexicoData.safetyGuide } country={ mexicoData.country } />

        <TipsSection tips={ mexicoData.datingTips } country={ mexicoData.country } />

        <TestimonialsSection testimonials={ mexicoData.testimonials } country={ mexicoData.country } />

        <CountryFAQ faqs={ mexicoData.faqs } country={ mexicoData.country } />

        <FutureExpansion countries={ mexicoData.futureCountries } />

        <FinalCTA country={ mexicoData.country } />
      </div>
    </>
  );
};

export default Mexico;
