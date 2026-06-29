import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';

const RegionsSection = ({ regions, country }) => {
  const [expandedRegion, setExpandedRegion] = useState(null);

  const toggleRegion = (index) => {
    setExpandedRegion(expandedRegion === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Dating Culture Across {country}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding regional diversity in dating preferences, values, and relationship expectations
          </p>
        </div>

        <div className="space-y-4">
          {regions.map((region, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <button
                onClick={() => toggleRegion(index)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {region.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {region.states.join(', ')}
                    </p>
                  </div>
                </div>
                {expandedRegion === index ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {/* Content */}
              {expandedRegion === index && (
                <div className="px-8 pb-8 space-y-4">
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Dating Culture
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {region.culture}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Key Characteristics
                    </h4>
                    <p className="text-gray-600">
                      {region.characteristics}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegionsSection;
