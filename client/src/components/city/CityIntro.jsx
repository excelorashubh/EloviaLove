const CityIntro = ({ data }) => {
  return (
    <section className="prose prose-lg max-w-none">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {data.title}
      </h2>
      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {data.content}
      </div>
    </section>
  );
};

export default CityIntro;
