import CityPage from '../../components/city/CityPage';

const torontoData = {
  city: 'Toronto',
  country: 'Canada',
  slug: 'toronto',
  metaTitle: 'Dating in Toronto — Meet Verified Singles | Elovia Love',
  metaDescription: 'Discover genuine connections in Toronto with verified profiles, safe date ideas, and relationship-focused matchmaking on Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Couple enjoying a date in Toronto',
  introduction: {
    title: 'Dating in Toronto – Meet Ambitious and Authentic Singles',
    content: `Toronto blends city energy with warm neighborhoods and diverse communities. From waterfront walks to trendy cafés, the city offers many opportunities for meaningful relationships.

Elovia Love helps Toronto singles connect with verified profiles who value trust, safety, and long-term connection. Whether you prefer exploring Distillery District or a quiet coffee date in Riverside, we’re here to help you find a real match.`
  },
  whyUnique: {
    title: 'What Makes Toronto Dating Special',
    content: `Toronto is a multicultural city with a strong emphasis on inclusivity and thoughtful connections. Singles here appreciate authenticity, mutual respect, and a partner who can grow with them through life’s changes.

With welcoming neighborhoods and a broad social scene, Toronto is ideal for singles who want a supportive community and serious relationships. The city’s diversity makes it easier to meet people with shared interests, values, and future plans.`
  },
  dateSpots: [
    {
      name: 'Distillery District Walk',
      area: 'Old Town',
      description: 'Explore cobblestone streets, art galleries, and cozy cafés in a beautifully restored heritage neighborhood.',
      atmosphere: 'Romantic, historic, charming',
      idealFor: 'First dates, artsy couples',
      safety: 'Safe and pedestrian-friendly',
      nearby: 'St. Lawrence Market, Sugar Beach',
      transport: 'King Streetcar or Union Station',
      tip: 'Visit on a weekend morning for a relaxed atmosphere and great coffee.'
    },
    {
      name: 'Harbourfront Promenade',
      area: 'Waterfront',
      description: 'A scenic route along Lake Ontario with cafes, street performers, and waterfront views.',
      atmosphere: 'Peaceful, scenic, modern',
      idealFor: 'Outdoor lovers, daytime dates',
      safety: 'Very safe and busy',
      nearby: 'CN Tower, Rogers Centre',
      transport: 'Union Station or Queen Streetcar',
      tip: 'Bring a light jacket and enjoy a lakeside stroll at sunset.'
    },
    {
      name: 'Kensington Market Café Hop',
      area: 'Kensington Market',
      description: 'A laid-back cultural area with eclectic cafés, vintage shops, and street art.',
      atmosphere: 'Bohemian, creative, lively',
      idealFor: 'Artistic dates, food lovers',
      safety: 'Safe during the day and early evening',
      nearby: 'Spadina Avenue, Chinatown',
      transport: 'Spadina or streetcar',
      tip: 'Explore the market before settling in a cozy café for conversation.'
    },
    {
      name: 'High Park Picnic',
      area: 'West End',
      description: 'A natural escape with gardens, trails, and peaceful picnic spots perfect for daytime dates.',
      atmosphere: 'Relaxed, natural, intimate',
      idealFor: 'Nature lovers, springtime dates',
      safety: 'Very safe and family-friendly',
      nearby: 'Bloor West Village',
      transport: 'High Park station or bus',
      tip: 'Visit during cherry blossom season for a memorable experience.'
    }
  ],
  popularAreas: [
    { name: 'Yorkville', description: 'Upscale neighborhood with cafes, galleries, and boutique shops.' },
    { name: 'Queen West', description: 'Trendy creative district with bars, galleries, and lively events.' },
    { name: 'Distillery District', description: 'Historic area ideal for relaxed, romantic dates.' },
    { name: 'The Beaches', description: 'Laid-back lakeside community perfect for sunset walks.' },
    { name: 'Downtown', description: 'Fast-moving city center with convenient meeting spots and transit access.' }
  ],
  datingTips: [
    {
      title: 'Layer for the Weather',
      content: 'Toronto weather can shift quickly, so dress in layers for outdoor dates.'
    },
    {
      title: 'Choose Comfortable Venues',
      content: 'Strolls, parks, and cafes allow more natural conversation than loud nightlife spots.'
    },
    {
      title: 'Be Punctual',
      content: 'Public transit is reliable, and arriving on time shows respect for your match.’'
    },
    {
      title: 'Share Local Favorites',
      content: 'Ask your match about their favorite Toronto neighborhoods and activities to build connection.'
    },
    {
      title: 'Respect Cultural Diversity',
      content: 'Toronto is one of the world’s most diverse cities, so openness and curiosity go a long way.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in Toronto',
    content: `Toronto is generally safe for dating, especially in well-known neighborhoods.

**Meet in public places** like cafes, waterfront paths, or parks.
**Share your whereabouts** with a friend before the date.
**Use reliable transport** like the subway or licensed ride services.
**Avoid isolated areas** after dark and choose busy, well-lit routes.
**Confirm your match** through Elovia Love before meeting in person.`
  },
  faqs: [
    { question: 'Is dating in Toronto expensive?', answer: 'It can be, but there are many affordable date options like parks, markets, and cozy cafes.' },
    { question: 'What are safe first date areas in Toronto?', answer: 'Harbourfront, Kensington Market, High Park, and Distillery District are excellent safe areas.' },
    { question: 'How can I meet serious singles in Toronto?', answer: 'Use Elovia Love’s verification and filters, complete your profile honestly, and connect with people who want meaningful relationships.' },
    { question: 'Are casual coffee dates common in Toronto?', answer: 'Yes, many Toronto singles prefer a relaxed coffee date as a comfortable first meeting.' }
  ],
  nearbyCities: [
    { name: 'Mississauga', slug: 'mississauga', distance: '30 km' },
    { name: 'Oakville', slug: 'oakville', distance: '40 km' },
    { name: 'Brampton', slug: 'brampton', distance: '45 km' },
    { name: 'Hamilton', slug: 'hamilton', distance: '70 km' }
  ]
};

const Toronto = () => {
  return <CityPage data={torontoData} />;
};

export default Toronto;
