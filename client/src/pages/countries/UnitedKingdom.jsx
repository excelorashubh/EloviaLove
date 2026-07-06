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
import { unitedKingdomData } from '../../data/countries/countriesData';

const UnitedKingdom = () => {
  return (
    <>
      <CountryPageSEO
        country={ unitedKingdomData.country }
        metaTitle={ unitedKingdomData.metaTitle }
        metaDescription={ unitedKingdomData.metaDescription }
        canonicalUrl={ `"/dating/${ unitedKingdomData.slug }"` }
        faqs={ unitedKingdomData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ unitedKingdomData.country }
          stats={ unitedKingdomData.heroStats }
        />

        <CountryIntro data={ unitedKingdomData.introduction } />

        <WhyChooseSection
          features={ unitedKingdomData.whyChooseUs }
          country={ unitedKingdomData.country }
        />

        <RegionsSection regions={ unitedKingdomData.regions } country={ unitedKingdomData.country } />

        <StatesGrid states={ unitedKingdomData.states } country={ unitedKingdomData.country } />

        <CitiesGrid
          cities={ unitedKingdomData.popularCities }
          country={ unitedKingdomData.country }
        />

        <SafetySection safetyData={ unitedKingdomData.safetyGuide } country={ unitedKingdomData.country } />

        <TipsSection tips={ unitedKingdomData.datingTips } country={ unitedKingdomData.country } />

        <TestimonialsSection testimonials={ unitedKingdomData.testimonials } country={ unitedKingdomData.country } />

        <CountryFAQ faqs={ unitedKingdomData.faqs } country={ unitedKingdomData.country } />

        <FutureExpansion countries={ unitedKingdomData.futureCountries } />

        <FinalCTA country={ unitedKingdomData.country } />
      </div>
    </>
  );
};

export default UnitedKingdom;
