import CitySEO from './CitySEO';
import CityBreadcrumbs from './CityBreadcrumbs';
import CityHero from './CityHero';
import CityIntro from './CityIntro';
import WhyUnique from './WhyUnique';
import DateSpots from './DateSpots';
import PopularAreas from './PopularAreas';
import DatingTips from './DatingTips';
import SafetyGuide from './SafetyGuide';
import WhyChoose from './WhyChoose';
import CityFAQ from './CityFAQ';
import NearbyCities from './NearbyCities';
import CityCTA from './CityCTA';

const CityPage = ({ data }) => {
  return (
    <>
      {/* SEO Meta Tags & Schema */}
      <CitySEO 
        city={data.city}
        metaTitle={data.metaTitle}
        metaDescription={data.metaDescription}
        canonicalUrl={`/dating-in-${data.slug}`}
        faqs={data.faqs}
      />
      
      {/* Page Content */}
      <div className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <CityBreadcrumbs city={data.city} />
        
        {/* Hero Section */}
        <CityHero data={data} />
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
          
          {/* Introduction */}
          <CityIntro data={data.introduction} />
          
          {/* Why Dating Here is Unique */}
          <WhyUnique data={data.whyUnique} city={data.city} />
          
          {/* Best First Date Spots */}
          <DateSpots spots={data.dateSpots} city={data.city} />
          
          {/* Popular Areas */}
          <PopularAreas areas={data.popularAreas} city={data.city} />
          
          {/* Dating Tips */}
          <DatingTips tips={data.datingTips} city={data.city} />
          
          {/* Safety Guide */}
          <SafetyGuide data={data.safetyGuide} city={data.city} />
          
          {/* Why Choose Elovia Love */}
          <WhyChoose />
          
          {/* Frequently Asked Questions */}
          <CityFAQ faqs={data.faqs} city={data.city} />
          
          {/* Nearby Cities */}
          <NearbyCities cities={data.nearbyCities} currentCity={data.city} />
          
          {/* Call to Action */}
          <CityCTA city={data.city} />
          
        </div>
      </div>
    </>
  );
};

export default CityPage;
