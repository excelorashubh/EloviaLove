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
import { australiaData } from '../../data/countries/countriesData';

const Australia = () => {
  return (
    <>
      <CountryPageSEO
        country={ australiaData.country }
        metaTitle={ australiaData.metaTitle }
        metaDescription={ australiaData.metaDescription }
        canonicalUrl={ `"/dating/${ australiaData.slug }"` }
        faqs={ australiaData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ australiaData.country }
          stats={ australiaData.heroStats }
        />

        <CountryIntro data={ australiaData.introduction } />

        <WhyChooseSection
          features={ australiaData.whyChooseUs }
          country={ australiaData.country }
        />

        <RegionsSection regions={ australiaData.regions } country={ australiaData.country } />

        <StatesGrid states={ australiaData.states } country={ australiaData.country } />

        <CitiesGrid
          cities={ australiaData.popularCities }
          country={ australiaData.country }
        />

        <SafetySection safetyData={ australiaData.safetyGuide } country={ australiaData.country } />

        <TipsSection tips={ australiaData.datingTips } country={ australiaData.country } />

        <TestimonialsSection testimonials={ australiaData.testimonials } country={ australiaData.country } />

        <CountryFAQ faqs={ australiaData.faqs } country={ australiaData.country } />

        <FutureExpansion countries={ australiaData.futureCountries } />

        <FinalCTA country={ australiaData.country } />
      </div>
    </>
  );
};

export default Australia;
