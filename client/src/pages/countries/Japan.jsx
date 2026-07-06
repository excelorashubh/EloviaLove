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
import { japanData } from '../../data/countries/countriesData';

const Japan = () => {
  return (
    <>
      <CountryPageSEO
        country={ japanData.country }
        metaTitle={ japanData.metaTitle }
        metaDescription={ japanData.metaDescription }
        canonicalUrl={ `"/dating/${ japanData.slug }"` }
        faqs={ japanData.faqs }
      />

      <div className="min-h-screen bg-white">
        <CountryHero
          country={ japanData.country }
          stats={ japanData.heroStats }
        />

        <CountryIntro data={ japanData.introduction } />

        <WhyChooseSection
          features={ japanData.whyChooseUs }
          country={ japanData.country }
        />

        <RegionsSection regions={ japanData.regions } country={ japanData.country } />

        <StatesGrid states={ japanData.states } country={ japanData.country } />

        <CitiesGrid
          cities={ japanData.popularCities }
          country={ japanData.country }
        />

        <SafetySection safetyData={ japanData.safetyGuide } country={ japanData.country } />

        <TipsSection tips={ japanData.datingTips } country={ japanData.country } />

        <TestimonialsSection testimonials={ japanData.testimonials } country={ japanData.country } />

        <CountryFAQ faqs={ japanData.faqs } country={ japanData.country } />

        <FutureExpansion countries={ japanData.futureCountries } />

        <FinalCTA country={ japanData.country } />
      </div>
    </>
  );
};

export default Japan;
