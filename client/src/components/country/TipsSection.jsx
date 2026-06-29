import { Lightbulb, MessageCircle, Heart, Shield, Coffee, Users } from 'lucide-react';

const iconMap = {
  0: Lightbulb,
  1: MessageCircle,
  2: Heart,
  3: Shield,
  4: Coffee,
  5: Users
};

const TipsSection = ({ tips, country }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-yellow-100 p-4 rounded-2xl mb-6">
            <Lightbulb className="w-12 h-12 text-yellow-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Dating Tips for Success in {country}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practical advice from relationship experts and successful couples on navigating Indian dating culture
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, index) => {
            const Icon = iconMap[index] || Lightbulb;
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-yellow-100"
              >
                <div className="bg-white p-3 rounded-xl inline-block mb-4">
                  <Icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {tip.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {tip.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-12 text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Want More Dating Advice?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Explore our comprehensive dating blog with articles on communication, first dates, relationship building, and Indian dating culture
          </p>
          <button 
            onClick={() => window.location.href = '/blog'}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Read Dating Blog
          </button>
        </div>
      </div>
    </section>
  );
};

export default TipsSection;
