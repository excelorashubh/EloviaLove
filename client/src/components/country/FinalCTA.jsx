import { Heart, Shield, Sparkles } from 'lucide-react';

const FinalCTA = ({ country }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="text-white">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Love in {country}?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join 50,000+ verified singles across 500+ Indian cities seeking genuine, meaningful relationships
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">100% Verified</h3>
              <p className="text-white/80">
                Government ID verification for every profile
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Matching</h3>
              <p className="text-white/80">
                Smart recommendations based on compatibility
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Serious Relationships</h3>
              <p className="text-white/80">
                Community focused on long-term connections
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={() => window.location.href = '/signup'}
            className="bg-white text-purple-600 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-block"
          >
            Create Your Free Profile →
          </button>

          {/* Trust Indicators */}
          <p className="text-white/75 mt-8 text-sm">
            Free to join • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
