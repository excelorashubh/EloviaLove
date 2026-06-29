import { Shield, AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const SafetyGuide = ({ data, city }) => {
  const safetyTips = [
    { icon: CheckCircle2, text: 'Always meet in public places' },
    { icon: CheckCircle2, text: 'Video call before meeting' },
    { icon: CheckCircle2, text: 'Tell friends your plans' },
    { icon: CheckCircle2, text: 'Use verified profiles only' },
    { icon: CheckCircle2, text: 'Never share financial information' },
    { icon: CheckCircle2, text: 'Trust your instincts' },
  ];

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-pink-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">{data.title}</h2>
      </div>

      {/* Safety Alert Box */}
      <div className="bg-pink-50 border-l-4 border-pink-600 p-6 rounded-r-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-pink-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Your Safety is Our Priority</h3>
            <p className="text-gray-700">
              Follow these guidelines when meeting someone from Elovia Love. If anything feels wrong, trust your instincts and prioritize your safety.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Safety Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {safetyTips.map((tip, index) => (
          <div key={index} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
            <tip.icon className="text-green-600 flex-shrink-0" size={20} />
            <span className="text-sm font-medium text-gray-700">{tip.text}</span>
          </div>
        ))}
      </div>

      {/* Detailed Safety Content */}
      <div className="prose prose-lg max-w-none">
        <div className="text-gray-700 leading-relaxed space-y-4">
          {data.content.split('\n\n').map((paragraph, index) => {
            // Bold text handling
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }
            return (
              <p key={index} className="text-base leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>

      {/* Emergency Contact Box */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Phone className="text-red-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">In Case of Emergency</h3>
            <p className="text-gray-700 mb-3">
              If you feel unsafe or threatened during a date, immediately leave the location and contact local authorities.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold text-gray-900">Police: 100</span>
              <span className="font-semibold text-gray-900">Women Helpline: 1091</span>
              <span className="font-semibold text-gray-900">Emergency: 112</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-3">
          Encountered suspicious behavior or fake profiles?
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold"
        >
          <Shield size={18} />
          Report to Our Safety Team →
        </Link>
      </div>
    </section>
  );
};

export default SafetyGuide;
