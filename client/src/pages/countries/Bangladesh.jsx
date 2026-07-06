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
import { bangladeshData } from '../../data/countries/countriesData';

const Bangladesh = () => {
  return (
    <>
      <CountryPageSEO
        country={ bangladeshData.country }
        metaTitle={ bangladeshData.metaTitle }
        metaDescription={ bangladeshData.metaDescription }
        canonicalUrl={ `"/dating/${ bangladeshData.slug }"` }
        faqs={ bangladeshData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ bangladeshData.country }
          stats={ bangladeshData.heroStats }
        />

        <CountryIntro data={ bangladeshData.introduction } />

        <WhyChooseSection
          features={ bangladeshData.whyChooseUs }
          country={ bangladeshData.country }
        />

        <RegionsSection regions={ bangladeshData.regions } country={ bangladeshData.country } />

        <StatesGrid states={ bangladeshData.states } country={ bangladeshData.country } />

        <CitiesGrid
          cities={ bangladeshData.popularCities }
          country={ bangladeshData.country }
        />

        <SafetySection safetyData={ bangladeshData.safetyGuide } country={ bangladeshData.country } />

        <TipsSection tips={ bangladeshData.datingTips } country={ bangladeshData.country } />

        <TestimonialsSection testimonials={ bangladeshData.testimonials } country={ bangladeshData.country } />

        <CountryFAQ faqs={ bangladeshData.faqs } country={ bangladeshData.country } />

        <FutureExpansion countries={ bangladeshData.futureCountries } />

        <FinalCTA country={ bangladeshData.country } />
      </div>
    </>
  );
};

export default Bangladesh;
