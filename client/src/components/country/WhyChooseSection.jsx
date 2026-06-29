import { Shield, Sparkles, Lock, Heart, ShieldCheck, Users, Filter, EyeOff } from 'lucide-react';

const iconMap = {
  'shield-check': ShieldCheck,
  'sparkles': Sparkles,
  'lock': Lock,
  'heart': Heart,
  'shield': Shield,
  'users': Users,
  'filter': Filter,
  'eye-off': EyeOff
};

const WhyChooseSection = ({ features, country }) => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Elovia Love for Dating in {country}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            India's most comprehensive dating platform built specifically for serious relationships, safety, and genuine connections
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/signup'}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Join 50,000+ Verified Members
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
