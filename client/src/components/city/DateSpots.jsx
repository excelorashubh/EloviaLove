import { MapPin, Clock, Heart, Shield, Coffee, Train } from 'lucide-react';

const DateSpots = ({ spots, city }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Best Places for First Dates in {city}
      </h2>
      
      <div className="grid gap-8">
        {spots.map((spot, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {spot.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{spot.area}</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {spot.description}
            </p>
            
            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-2">
                <Heart className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Atmosphere</p>
                  <p className="text-sm text-gray-600">{spot.atmosphere}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Safety</p>
                  <p className="text-sm text-gray-600">{spot.safety}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Train className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Transport</p>
                  <p className="text-sm text-gray-600">{spot.transport}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Coffee className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Nearby</p>
                  <p className="text-sm text-gray-600">{spot.nearby}</p>
                </div>
              </div>
            </div>
            
            {/* Ideal For */}
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-1">Ideal For</p>
              <p className="text-sm text-gray-600">{spot.idealFor}</p>
            </div>
            
            {/* Pro Tip */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900 mb-1">💡 Pro Tip</p>
              <p className="text-sm text-blue-800">{spot.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DateSpots;
