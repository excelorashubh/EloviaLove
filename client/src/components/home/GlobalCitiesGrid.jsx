import { MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { globalCities } from '../../data/homeData';

const GlobalCitiesGrid = ({ cities = globalCities }) => {
  // Defensive programming: ensure we have valid data
  const safeCities = Array.isArray(cities) && cities.length > 0 
    ? cities 
    : globalCities || [];

  if (safeCities.length === 0) {
    console.warn('[GlobalCitiesGrid] No city data available');
    return null; // Gracefully hide component if no data
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Popular Cities Worldwide
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Connect with verified singles in major cities across the globe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeCities.map((city, index) => (
            city?.hasPage ? (
              <Link
                key={city?.slug || index}
                to={`/dating-in-${city?.slug || ''}`}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {city?.name || 'Unknown City'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{city?.country || 'Unknown'}</p>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                </div>

                <div className="flex items-center text-slate-600 text-sm mb-4">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{city?.population || 'N/A'} metro</span>
                </div>

                <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-2 transition-transform">
                  Explore Dating in {city?.name || 'City'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ) : (
              <div
                key={city?.slug || index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {city?.name || 'Unknown City'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{city?.country || 'Unknown'}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center text-slate-600 text-sm mb-4">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{city?.population || 'N/A'} metro</span>
                </div>

                <div className="text-sm text-slate-500">
                  Coming soon - Join waitlist
                </div>
              </div>
            )
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/discover'}
            className="bg-gradient-to-r from-primary-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            View All 500+ Cities
          </button>
        </div>
      </div>
    </section>
  );
};

export default GlobalCitiesGrid;
