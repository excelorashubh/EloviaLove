import { Heart, MapPin, CheckCircle, Quote } from 'lucide-react';
import { globalTestimonials } from '../../data/homeData';

const GlobalTestimonials = ({ testimonials = globalTestimonials }) => {
  // Defensive programming: ensure we have valid data
  const safeTestimonials = Array.isArray(testimonials) && testimonials.length > 0 
    ? testimonials 
    : globalTestimonials || [];

  if (safeTestimonials.length === 0) {
    console.warn('[GlobalTestimonials] No testimonial data available');
    return null; // Gracefully hide component if no data
  }

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-pink-100 p-4 rounded-2xl mb-6">
            <Heart className="w-12 h-12 text-pink-600" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Success Stories from Around the World
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real couples who found meaningful relationships through Elovia Love
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-pink-100 relative"
            >
              <div className="absolute top-6 right-6 text-pink-200">
                <Quote className="w-12 h-12" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {testimonial?.names || 'Anonymous'}
                  </h3>
                  {testimonial?.verified && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <div className="flex items-center text-slate-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{testimonial?.location || 'Worldwide'}</span>
                </div>

                <p className="text-slate-700 leading-relaxed italic">
                  "{testimonial?.story || 'Found love through Elovia Love'}"
                </p>

                <div className="flex space-x-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="w-4 h-4 text-pink-400 fill-pink-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalTestimonials;
