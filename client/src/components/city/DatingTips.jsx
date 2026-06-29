import { Lightbulb, CheckCircle } from 'lucide-react';

const DatingTips = ({ tips, city }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="text-pink-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">
          Dating Tips for {city}
        </h2>
      </div>
      <p className="text-gray-600 mb-8 text-lg">
        Local insights to help you navigate the dating scene and make genuine connections.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-pink-200 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-pink-600" size={18} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              {tip.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DatingTips;
