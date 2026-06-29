import { Heart, UserPlus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CityCTA = ({ city }) => {
  return (
    <section>
      {/* Main CTA Box */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
        <div className="max-w-3xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Heart size={32} fill="currentColor" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold mb-4">
            Ready to Meet Genuine Singles in {city}?
          </h2>
          
          {/* Subheading */}
          <p className="text-xl text-white/90 mb-8">
            Join thousands of verified members building meaningful relationships every day.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <UserPlus size={20} />
              <span className="font-medium">Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="font-medium">AI Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={20} />
              <span className="font-medium">Verified Profiles</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/signup"
            className="inline-block bg-white text-pink-600 px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Create Your Free Profile Now
          </Link>

          {/* Subtext */}
          <p className="mt-6 text-sm text-white/80">
            No credit card required • Start chatting in minutes • 100% safe & secure
          </p>
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Already Have an Account?
          </h3>
          <p className="text-gray-600 mb-4">
            Sign in and continue finding your perfect match in {city}
          </p>
          <Link
            to="/login"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Learn More About Safety
          </h3>
          <p className="text-gray-600 mb-4">
            Discover how we keep the Elovia Love community safe and verified
          </p>
          <Link
            to="/dating-safety-india"
            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
          >
            Safety Guide
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CityCTA;
