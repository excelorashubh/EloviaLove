import { MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CitiesGrid = ({ cities, country }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Popular Cities for Dating in {country}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover active dating scenes, verified singles, and local date spot recommendations in major Indian cities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city, index) => (
            <Link
              key={index}
              to={`/dating-in-${city.slug}`}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{city.state}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>

              {/* Population */}
              {city.population && (
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{city.population} metro population</span>
                </div>
              )}

              {/* Highlight */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {city.highlight}
              </p>

              {/* CTA */}
              <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform">
                Explore dating in {city.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/discover'}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            View All 500+ Cities
          </button>
        </div>
      </div>
    </section>
  );
};

export default CitiesGrid;
