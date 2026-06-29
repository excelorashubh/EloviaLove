const WhyUnique = ({ data, city }) => {
  return (
    <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        {data.title}
      </h2>
      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {data.content}
      </div>
    </section>
  );
};

export default WhyUnique;
