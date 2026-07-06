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
import { germanyData } from '../../data/countries/countriesData';

const Germany = () => {
  return (
    <>
      <CountryPageSEO
        country={ germanyData.country }
        metaTitle={ germanyData.metaTitle }
        metaDescription={ germanyData.metaDescription }
        canonicalUrl={ `"/dating/${ germanyData.slug }"` }
        faqs={ germanyData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ germanyData.country }
          stats={ germanyData.heroStats }
        />

        <CountryIntro data={ germanyData.introduction } />

        <WhyChooseSection
          features={ germanyData.whyChooseUs }
          country={ germanyData.country }
        />

        <RegionsSection regions={ germanyData.regions } country={ germanyData.country } />

        <StatesGrid states={ germanyData.states } country={ germanyData.country } />

        <CitiesGrid
          cities={ germanyData.popularCities }
          country={ germanyData.country }
        />

        <SafetySection safetyData={ germanyData.safetyGuide } country={ germanyData.country } />

        <TipsSection tips={ germanyData.datingTips } country={ germanyData.country } />

        <TestimonialsSection testimonials={ germanyData.testimonials } country={ germanyData.country } />

        <CountryFAQ faqs={ germanyData.faqs } country={ germanyData.country } />

        <FutureExpansion countries={ germanyData.futureCountries } />

        <FinalCTA country={ germanyData.country } />
      </div>
    </>
  );
};

export default Germany;
