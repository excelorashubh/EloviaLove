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
import { southAfricaData } from '../../data/countries/countriesData';

const SouthAfrica = () => {
  return (
    <>
      <CountryPageSEO
        country={ southAfricaData.country }
        metaTitle={ southAfricaData.metaTitle }
        metaDescription={ southAfricaData.metaDescription }
        canonicalUrl={ `"/dating/${ southAfricaData.slug }"` }
        faqs={ southAfricaData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ southAfricaData.country }
          stats={ southAfricaData.heroStats }
        />

        <CountryIntro data={ southAfricaData.introduction } />

        <WhyChooseSection
          features={ southAfricaData.whyChooseUs }
          country={ southAfricaData.country }
        />

        <RegionsSection regions={ southAfricaData.regions } country={ southAfricaData.country } />

        <StatesGrid states={ southAfricaData.states } country={ southAfricaData.country } />

        <CitiesGrid
          cities={ southAfricaData.popularCities }
          country={ southAfricaData.country }
        />

        <SafetySection safetyData={ southAfricaData.safetyGuide } country={ southAfricaData.country } />

        <TipsSection tips={ southAfricaData.datingTips } country={ southAfricaData.country } />

        <TestimonialsSection testimonials={ southAfricaData.testimonials } country={ southAfricaData.country } />

        <CountryFAQ faqs={ southAfricaData.faqs } country={ southAfricaData.country } />

        <FutureExpansion countries={ southAfricaData.futureCountries } />

        <FinalCTA country={ southAfricaData.country } />
      </div>
    </>
  );
};

export default SouthAfrica;
