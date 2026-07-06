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
import { unitedArabEmiratesData } from '../../data/countries/countriesData';

const UnitedArabEmirates = () => {
  return (
    <>
      <CountryPageSEO
        country={ unitedArabEmiratesData.country }
        metaTitle={ unitedArabEmiratesData.metaTitle }
        metaDescription={ unitedArabEmiratesData.metaDescription }
        canonicalUrl={ `"/dating/${ unitedArabEmiratesData.slug }"` }
        faqs={ unitedArabEmiratesData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ unitedArabEmiratesData.country }
          stats={ unitedArabEmiratesData.heroStats }
        />

        <CountryIntro data={ unitedArabEmiratesData.introduction } />

        <WhyChooseSection
          features={ unitedArabEmiratesData.whyChooseUs }
          country={ unitedArabEmiratesData.country }
        />

        <RegionsSection regions={ unitedArabEmiratesData.regions } country={ unitedArabEmiratesData.country } />

        <StatesGrid states={ unitedArabEmiratesData.states } country={ unitedArabEmiratesData.country } />

        <CitiesGrid
          cities={ unitedArabEmiratesData.popularCities }
          country={ unitedArabEmiratesData.country }
        />

        <SafetySection safetyData={ unitedArabEmiratesData.safetyGuide } country={ unitedArabEmiratesData.country } />

        <TipsSection tips={ unitedArabEmiratesData.datingTips } country={ unitedArabEmiratesData.country } />

        <TestimonialsSection testimonials={ unitedArabEmiratesData.testimonials } country={ unitedArabEmiratesData.country } />

        <CountryFAQ faqs={ unitedArabEmiratesData.faqs } country={ unitedArabEmiratesData.country } />

        <FutureExpansion countries={ unitedArabEmiratesData.futureCountries } />

        <FinalCTA country={ unitedArabEmiratesData.country } />
      </div>
    </>
  );
};

export default UnitedArabEmirates;
