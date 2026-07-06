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
import { unitedStatesData } from '../../data/countries/countriesData';

const UnitedStates = () => {
  return (
    <>
      <CountryPageSEO
        country={ unitedStatesData.country }
        metaTitle={ unitedStatesData.metaTitle }
        metaDescription={ unitedStatesData.metaDescription }
        canonicalUrl={ `"/dating/${ unitedStatesData.slug }"` }
        faqs={ unitedStatesData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ unitedStatesData.country }
          stats={ unitedStatesData.heroStats }
        />

        <CountryIntro data={ unitedStatesData.introduction } />

        <WhyChooseSection
          features={ unitedStatesData.whyChooseUs }
          country={ unitedStatesData.country }
        />

        <RegionsSection regions={ unitedStatesData.regions } country={ unitedStatesData.country } />

        <StatesGrid states={ unitedStatesData.states } country={ unitedStatesData.country } />

        <CitiesGrid
          cities={ unitedStatesData.popularCities }
          country={ unitedStatesData.country }
        />

        <SafetySection safetyData={ unitedStatesData.safetyGuide } country={ unitedStatesData.country } />

        <TipsSection tips={ unitedStatesData.datingTips } country={ unitedStatesData.country } />

        <TestimonialsSection testimonials={ unitedStatesData.testimonials } country={ unitedStatesData.country } />

        <CountryFAQ faqs={ unitedStatesData.faqs } country={ unitedStatesData.country } />

        <FutureExpansion countries={ unitedStatesData.futureCountries } />

        <FinalCTA country={ unitedStatesData.country } />
      </div>
    </>
  );
};

export default UnitedStates;
