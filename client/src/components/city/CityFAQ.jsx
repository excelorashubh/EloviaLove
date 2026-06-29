import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const CityFAQ = ({ faqs, city }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="text-pink-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
      </div>
      <p className="text-gray-600 mb-8 text-lg">
        Everything you need to know about using Elovia Love in {city}
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-pink-200 transition-colors"
          >
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 pr-4">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="text-pink-600 flex-shrink-0" size={20} />
              ) : (
                <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
              )}
            </button>

            {/* Answer */}
            {openIndex === index && (
              <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <div className="mt-8 text-center bg-pink-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">
          Our support team is here to help you with any queries about dating in {city}
        </p>
        <a
          href="/contact"
          className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </section>
  );
};

export default CityFAQ;
