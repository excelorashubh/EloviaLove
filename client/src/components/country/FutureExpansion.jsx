import { Globe, Bell } from 'lucide-react';

const FutureExpansion = ({ countries }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-100 p-4 rounded-2xl mb-6">
            <Globe className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Expanding Globally
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elovia Love is coming soon to more countries. Connect with verified singles worldwide.
          </p>
        </div>

        {/* Countries Grid */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {countries.map((country, index) => (
            <div
              key={index}
              className="bg-white px-6 py-3 rounded-full border-2 border-blue-100 text-gray-700 font-medium hover:border-blue-300 hover:shadow-md transition-all"
            >
              {country}
            </div>
          ))}
        </div>

        {/* Notify CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <Bell className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">
            Want Elovia Love in Your Country?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join our waitlist to be notified when we launch in your region. Early members get exclusive benefits!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-full text-gray-900 flex-1 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all whitespace-nowrap">
              Join Waitlist
            </button>
          </div>
          <p className="text-white/75 text-sm mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FutureExpansion;
