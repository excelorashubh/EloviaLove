import { Shield, MapPin, Heart, MessageCircle, ChevronDown } from 'lucide-react';

const iconMap = {
  'shield-check': Shield,
  'map-pin': MapPin,
  'heart': Heart,
  'message-circle': MessageCircle
};

const CountryHero = ({ country, stats }) => {
  const scrollToContent = () => {
    const element = document.getElementById('main-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Dating in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">{country}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            India's most trusted dating platform connecting verified singles across 500+ cities for meaningful, lasting relationships
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
            >
              ❤️ Start Finding Love
            </button>
            <button 
              onClick={scrollToContent}
              className="bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl border-2 border-gray-200 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
            >
              Explore Cities
            </button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Shield;
            return (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex justify-center mb-3">
                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-12">
          <button 
            onClick={scrollToContent}
            className="animate-bounce text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Scroll to content"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryHero;
