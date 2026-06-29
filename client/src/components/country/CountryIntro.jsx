const CountryIntro = ({ data }) => {
  return (
    <section id="main-content" className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">
        {data.title}
      </h2>
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
        {data.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
};

export default CountryIntro;
