import { MapPin } from 'lucide-react';

const PopularAreas = ({ areas, city }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Popular Areas to Meet Singles in {city}
      </h2>
      <p className="text-gray-600 mb-8">
        These neighborhoods have the highest concentration of active singles on Elovia Love
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-pink-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {area.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {area.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularAreas;
