import { Shield, Heart, Users, CheckCircle, Lock, Target, MessageCircle, Ban } from 'lucide-react';

const WhyChoose = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Every profile undergoes ID verification to ensure you\'re talking to real people, not fake accounts or bots.'
    },
    {
      icon: Target,
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm analyzes your interests, values, and preferences to suggest highly compatible matches.'
    },
    {
      icon: Heart,
      title: 'Serious Relationships',
      description: 'Focus on meaningful connections, not casual hookups. Find partners looking for long-term commitment.'
    },
    {
      icon: Lock,
      title: 'Privacy Protection',
      description: 'Control who sees your profile, photos, and contact information. Your data is encrypted and secure.'
    },
    {
      icon: Users,
      title: 'Real People',
      description: 'Join thousands of genuine singles across India looking for authentic relationships and life partners.'
    },
    {
      icon: MessageCircle,
      title: 'Secure Messaging',
      description: 'Chat safely within our platform with end-to-end encryption and built-in safety features.'
    },
    {
      icon: Ban,
      title: 'No Fake Accounts',
      description: 'Advanced AI detection and manual verification eliminate fake profiles, scammers, and bots.'
    },
    {
      icon: CheckCircle,
      title: 'Community Guidelines',
      description: 'Strict policies ensure respectful behavior. Report and block features keep the community safe.'
    }
  ];

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Choose Elovia Love?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          India's most trusted dating platform for verified singles seeking meaningful relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-white to-pink-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <feature.icon className="text-pink-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-6 bg-white border border-gray-200 rounded-full px-8 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">Verified Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-blue-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">Secure & Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="text-pink-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">10,000+ Couples</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
