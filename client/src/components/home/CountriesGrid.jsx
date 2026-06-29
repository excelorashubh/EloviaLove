import { ArrowRight, MapPin } from 'lucide-react';
import { featuredCountries } from '../../data/homeData';

const CountriesGrid = ({ countries = featuredCountries }) => {
  // Defensive programming: ensure we have valid data
  const safeCountries = Array.isArray(countries) && countries.length > 0 
    ? countries 
    : featuredCountries || [];

  if (safeCountries.length === 0) {
    console.warn('[CountriesGrid] No country data available');
    return null; // Gracefully hide component if no data
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Explore Dating by Country
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Find verified singles in your country or explore international connections
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeCountries.map((country, index) => (
            <div
              key={country?.slug || index}
              onClick={() => {
                if (country?.slug === 'india') {
                  window.location.href = '/dating-in-india';
                }
              }}
              className={`bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                country?.featured 
                  ? 'border-primary-500 hover:shadow-2xl hover:scale-105' 
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
              }`}
            >
              {country?.featured && (
                <div className="bg-gradient-to-r from-primary-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                  FEATURED
                </div>
              )}
              
              <div className="text-5xl mb-4">{country?.flag || '🌍'}</div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {country?.name || 'Unknown'}
              </h3>
              
              <p className="text-sm text-slate-600 mb-3">
                {country?.description || 'Connect with verified singles'}
              </p>
              
              <div className="flex items-center text-sm text-slate-500 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{country?.cities || 0}+ cities</span>
              </div>
              
              <div className="flex items-center text-primary-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                Explore {country?.name || 'Location'} <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Don't see your country? We're expanding rapidly worldwide.
          </p>
          <button 
            onClick={() => window.location.href = '/contact'}
            className="text-primary-600 font-medium hover:underline"
          >
            Request Your Country →
          </button>
        </div>
      </div>
    </section>
  );
};

export default CountriesGrid;
