import { Globe, MapPin, Users, MessageCircle, Shield, Zap } from 'lucide-react';

const GlobalStats = ({ stats }) => {
  const statItems = [
    { icon: Globe, label: 'Countries', value: stats.countries, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: MapPin, label: 'Cities', value: stats.cities, color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Users, label: 'Verified Members', value: stats.verifiedMembers, color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: MessageCircle, label: 'Conversations', value: stats.conversations, color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Shield, label: 'Avg Verification', value: stats.avgVerificationTime, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: Zap, label: 'Response Rate', value: stats.responseRate, color: 'text-orange-500', bg: 'bg-orange-50' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted Worldwide for Meaningful Connections
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Join verified singles from across the globe seeking genuine, lasting relationships
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statItems.map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalStats;
