import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NearbyCities = ({ cities, currentCity }) => {
  if (!cities || cities.length === 0) return null;

  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Dating in Cities Near {currentCity}
      </h2>
      <p className="text-gray-600 mb-8 text-lg">
        Explore dating opportunities in nearby cities and expand your search radius
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cities.map((city, index) => (
          <Link
            key={index}
            to={`/dating-in-${city.slug}`}
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-pink-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-pink-600" size={20} />
                <h3 className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  {city.name}
                </h3>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" size={18} />
            </div>
            <p className="text-sm text-gray-600">
              {city.distance} from {currentCity}
            </p>
          </Link>
        ))}
      </div>

      {/* Additional Cities Link */}
      <div className="mt-8 text-center">
        <Link
          to="/dating-in-india"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold"
        >
          View All Cities in India
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

export default NearbyCities;
