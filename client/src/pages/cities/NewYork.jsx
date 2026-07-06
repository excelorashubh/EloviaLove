import CityPage from '../../components/city/CityPage';

const newYorkData = {
  city: 'New York',
  country: 'United States',
  slug: 'new-york',
  metaTitle: 'Dating in New York — Meet Verified Singles | Elovia Love',
  metaDescription: 'Explore meaningful relationships in New York City with verified dating, smart date ideas, and trusted local matchmaking on Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Couple walking in New York City at dusk',
  introduction: {
    title: 'Dating in New York – Connect with Ambitious Singles in the City That Never Sleeps',
    content: `New York City is full of energy, ambition, and endless date possibilities. From iconic landmarks to neighborhood hideaways, the city offers something for every kind of relationship seeker.

Elovia Love helps New York singles find verified matches who are serious about long-term connection, not just casual encounters. Whether you prefer a rooftop conversation or a walk through a quiet park, we make it easier to meet someone genuine.`
  },
  whyUnique: {
    title: 'What Makes New York Dating Distinct',
    content: `New York dating is fast-paced but meaningful when you find the right match. The city draws professionals, creatives, and international singles who value ambition, independence, and authenticity.

Dating here is about seizing moments together—whether at a gallery opening in Chelsea, a walk across Brooklyn Bridge, or a cozy coffee date in the West Village. Elovia Love helps you filter those who want real relationships amid the city’s energy.`
  },
  dateSpots: [
    {
      name: 'Central Park Picnic',
      area: 'Manhattan',
      description: 'A timeless NYC date with green lawns, boat rides, and strolling paths in the heart of the city.',
      atmosphere: 'Romantic, relaxed, scenic',
      idealFor: 'Daytime dates, nature lovers',
      safety: 'Very safe during daylight hours',
      nearby: 'The Metropolitan Museum, Upper East Side cafes',
      transport: 'Subway at 59th Street or 72nd Street',
      tip: 'Bring snacks and choose a quieter spot near the Conservatory Garden.'
    },
    {
      name: 'Brooklyn Bridge Walk',
      area: 'Brooklyn / Manhattan',
      description: 'A memorable walk with skyline views, perfect for conversation and photos.',
      atmosphere: 'Iconic, scenic, adventurous',
      idealFor: 'First dates, photo lovers',
      safety: 'Busy and well-patrolled',
      nearby: 'DUMBO, Brooklyn Bridge Park',
      transport: 'Subway to Brooklyn Bridge-City Hall',
      tip: 'Walk early in the morning or later in the evening to avoid crowds.'
    },
    {
      name: 'High Line Stroll',
      area: 'Meatpacking District',
      description: 'A rooftop park built on a historic rail line offering art, gardens, and city views.',
      atmosphere: 'Trendy, artistic, relaxed',
      idealFor: 'Casual dates, urban explorers',
      safety: 'Safe and popular during daytime',
      nearby: 'Chelsea Market, Whitney Museum',
      transport: '14th Street subway stations',
      tip: 'Pair the walk with a visit to Chelsea Market for food and dessert.'
    },
    {
      name: 'Brooklyn Coffee Date',
      area: 'Williamsburg',
      description: 'A laid-back meetup in a creative neighborhood surrounded by cafes, galleries, and boutique shops.',
      atmosphere: 'Hip, casual, welcoming',
      idealFor: 'Young professionals, coffee lovers',
      safety: 'Safe and lively',
      nearby: 'McCarren Park, Bedford Avenue shops',
      transport: 'L train to Bedford Avenue',
      tip: 'Choose a quieter cafe off the main drag for better conversation.'
    }
  ],
  popularAreas: [
    { name: 'Manhattan', description: 'The city’s core for dining, culture, and iconic Manhattan dates.' },
    { name: 'Brooklyn', description: 'Creative neighborhoods with relaxed venues and trendy meeting spots.' },
    { name: 'Queens', description: 'Diverse cuisine and quieter neighborhoods for genuine connection.' },
    { name: 'West Village', description: 'Cozy streets and intimate restaurants perfect for serious first dates.' },
    { name: 'Upper East Side', description: 'Elegant cafes and museum-centered outings for cultured couples.' }
  ],
  datingTips: [
    {
      title: 'Be On Time',
      content: 'New Yorkers tend to value punctuality, so arrive on time or communicate clearly if you are delayed.'
    },
    {
      title: 'Keep It Simple',
      content: 'Start with a coffee or walk before moving to a longer evening if the connection feels right.'
    },
    {
      title: 'Use Public Transit',
      content: 'The subway is often the fastest way to navigate the city and can make meetups easier.'
    },
    {
      title: 'Choose Comfortable Venues',
      content: 'Busy restaurants are fun, but quieter cafes and parks create a better atmosphere for conversation.'
    },
    {
      title: 'Share Your Interests',
      content: 'Talk about your favorite NYC neighborhoods, hobbies, and what you value in a relationship.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in New York',
    content: `New York is a busy city, and good safety habits make a big difference.

**Meet in public places** like cafes, parks, and well-trafficked streets for the first few dates.
**Tell a friend** your plans and share your location if you feel comfortable.
**Use official transport** like the subway, bus, or app-based ride services after dark.
**Avoid isolated areas** in quiet parks or streets at night.
**Verify your match** on Elovia Love before meeting in person to help ensure confidence and trust.`
  },
  faqs: [
    { question: 'Is dating in New York fast-paced?', answer: 'It can be, but on Elovia Love you can connect with singles who want a slower, more meaningful approach to relationships.' },
    { question: 'What are good first date spots in NYC?', answer: 'Central Park, the High Line, Brooklyn Bridge, and cozy coffee shops are excellent first-date choices.' },
    { question: 'Should I pay for the date in New York?', answer: 'It’s thoughtful to offer, but many modern couples decide together or take turns based on comfort.' },
    { question: 'How do I find verified singles in NYC?', answer: 'Use filters, complete your profile, and prioritize profiles with verification badges and clear relationship goals.' }
  ],
  nearbyCities: [
    { name: 'Jersey City', slug: 'jersey-city', distance: '8 km' },
    { name: 'Hoboken', slug: 'hoboken', distance: '10 km' },
    { name: 'Newark', slug: 'newark', distance: '22 km' },
    { name: 'Stamford', slug: 'stamford', distance: '50 km' }
  ]
};

const NewYork = () => {
  return <CityPage data={newYorkData} />;
};

export default NewYork;
