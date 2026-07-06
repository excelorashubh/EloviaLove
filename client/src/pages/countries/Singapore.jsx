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
import { singaporeData } from '../../data/countries/countriesData';

const Singapore = () => {
  return (
    <>
      <CountryPageSEO
        country={ singaporeData.country }
        metaTitle={ singaporeData.metaTitle }
        metaDescription={ singaporeData.metaDescription }
        canonicalUrl={ `"/dating/${ singaporeData.slug }"` }
        faqs={ singaporeData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ singaporeData.country }
          stats={ singaporeData.heroStats }
        />

        <CountryIntro data={ singaporeData.introduction } />

        <WhyChooseSection
          features={ singaporeData.whyChooseUs }
          country={ singaporeData.country }
        />

        <RegionsSection regions={ singaporeData.regions } country={ singaporeData.country } />

        <StatesGrid states={ singaporeData.states } country={ singaporeData.country } />

        <CitiesGrid
          cities={ singaporeData.popularCities }
          country={ singaporeData.country }
        />

        <SafetySection safetyData={ singaporeData.safetyGuide } country={ singaporeData.country } />

        <TipsSection tips={ singaporeData.datingTips } country={ singaporeData.country } />

        <TestimonialsSection testimonials={ singaporeData.testimonials } country={ singaporeData.country } />

        <CountryFAQ faqs={ singaporeData.faqs } country={ singaporeData.country } />

        <FutureExpansion countries={ singaporeData.futureCountries } />

        <FinalCTA country={ singaporeData.country } />
      </div>
    </>
  );
};

export default Singapore;
