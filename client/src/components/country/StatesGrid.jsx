import { MapPin, ArrowRight } from 'lucide-react';

const StatesGrid = ({ states, country }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Dating by State in {country}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find verified singles in your state with localized dating experiences and regional compatibility
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {states.map((state, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
              onClick={() => {
                // Future: Navigate to state page
                console.log(`Navigate to /dating-in-${state.slug}`);
              }}
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {state.name}
                  </h3>
                  {state.cities && (
                    <p className="text-sm text-gray-500 mt-1">
                      {state.cities} cities supported
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {state.description}
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Can't find your state? We're expanding rapidly across all of {country}.{' '}
            <a href="/contact" className="text-purple-600 font-medium hover:underline">
              Request your state
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatesGrid;
