import { Heart, MapPin, CheckCircle, Quote } from 'lucide-react';

const TestimonialsSection = ({ testimonials, country }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-pink-100 p-4 rounded-2xl mb-6">
            <Heart className="w-12 h-12 text-pink-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories from {country}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real couples who found meaningful relationships through Elovia Love
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-pink-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-pink-200">
                <Quote className="w-12 h-12" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Names */}
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {testimonial.name}
                  </h3>
                  {testimonial.verified && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{testimonial.location}</span>
                </div>

                {/* Story */}
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.story}"
                </p>

                {/* Hearts decoration */}
                <div className="flex space-x-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="w-4 h-4 text-pink-400 fill-pink-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Your Story CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Found love on Elovia? Share your success story with us!
          </p>
          <button 
            onClick={() => window.location.href = '/contact'}
            className="text-purple-600 font-medium hover:underline"
          >
            Submit Your Story →
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
