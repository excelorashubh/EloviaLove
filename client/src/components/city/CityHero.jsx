import { Heart, Shield, Users, Sparkles } from 'lucide-react';

const CityHero = ({ data }) => {
  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Dating in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">{data.city}</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Meet verified singles looking for genuine relationships in {data.city}
        </p>
        
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Verified Profiles</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">AI Matching</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Heart className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-medium text-gray-700">Meaningful Connections</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Local Singles</span>
          </div>
        </div>
        
        {/* CTA Button */}
        <button 
          onClick={() => window.location.href = '/signup'}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          Start Meeting Singles in {data.city}
        </button>
      </div>
    </div>
  );
};

export default CityHero;
