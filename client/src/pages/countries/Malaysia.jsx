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
import { malaysiaData } from '../../data/countries/countriesData';

const Malaysia = () => {
  return (
    <>
      <CountryPageSEO
        country={ malaysiaData.country }
        metaTitle={ malaysiaData.metaTitle }
        metaDescription={ malaysiaData.metaDescription }
        canonicalUrl={ `"/dating/${ malaysiaData.slug }"` }
        faqs={ malaysiaData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ malaysiaData.country }
          stats={ malaysiaData.heroStats }
        />

        <CountryIntro data={ malaysiaData.introduction } />

        <WhyChooseSection
          features={ malaysiaData.whyChooseUs }
          country={ malaysiaData.country }
        />

        <RegionsSection regions={ malaysiaData.regions } country={ malaysiaData.country } />

        <StatesGrid states={ malaysiaData.states } country={ malaysiaData.country } />

        <CitiesGrid
          cities={ malaysiaData.popularCities }
          country={ malaysiaData.country }
        />

        <SafetySection safetyData={ malaysiaData.safetyGuide } country={ malaysiaData.country } />

        <TipsSection tips={ malaysiaData.datingTips } country={ malaysiaData.country } />

        <TestimonialsSection testimonials={ malaysiaData.testimonials } country={ malaysiaData.country } />

        <CountryFAQ faqs={ malaysiaData.faqs } country={ malaysiaData.country } />

        <FutureExpansion countries={ malaysiaData.futureCountries } />

        <FinalCTA country={ malaysiaData.country } />
      </div>
    </>
  );
};

export default Malaysia;
