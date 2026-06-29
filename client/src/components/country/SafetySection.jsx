import { Shield, Video, DollarSign, MapPin, Eye, AlertTriangle, Lock, MessageCircle, Wine, Flag } from 'lucide-react';

const iconMap = {
  'Profile Verification': Shield,
  'Meeting in Public First': MapPin,
  'Video Call Before Meeting': Video,
  'Share Your Plans': MessageCircle,
  'Transportation Safety': MapPin,
  'Financial Red Flags': DollarSign,
  'Privacy Protection': Lock,
  'Trust Your Instincts': Eye,
  'Alcohol Awareness': Wine,
  'Reporting System': Flag
};

const SafetySection = ({ safetyData, country }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 p-4 rounded-2xl mb-6">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {safetyData.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your safety is our top priority. Follow these essential guidelines for secure, confident dating in {country}
          </p>
        </div>

        {/* Safety Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {safetyData.sections.map((section, index) => {
            const Icon = iconMap[section.heading] || Shield;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {section.heading}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency CTA */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-center text-white">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            Experiencing Harassment or Unsafe Behavior?
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Report immediately through our platform. Our safety team reviews reports 24/7 and takes swift action including permanent bans.
          </p>
          <button 
            onClick={() => window.location.href = '/report-abuse'}
            className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
          >
            Report Safety Concern
          </button>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
