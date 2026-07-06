import CityPage from '../../components/city/CityPage';

const singaporeData = {
  city: 'Singapore',
  country: 'Singapore',
  slug: 'singapore',
  metaTitle: 'Dating in Singapore — Meet Verified Singles | Elovia Love',
  metaDescription: 'Meet verified singles in Singapore through safe dating, local insights, and meaningful relationship matches on Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1509857045094-86cd2aca25e2?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Couple enjoying a date in Singapore city',
  introduction: {
    title: 'Dating in Singapore – Discover Genuine Connections in the Lion City',
    content: `Singapore is a modern, multicultural city where ambition meets elegant lifestyle. From city gardens to riverside dinners, the city offers ideal settings for singles seeking lasting relationships.

Elovia Love helps Singapore singles find verified matches who value respect, trust, and meaningful conversations. Whether you prefer a quiet park date or a stylish café meetup, we guide you toward real connections.`
  },
  whyUnique: {
    title: 'Why Singapore Dating Works for Serious Singles',
    content: `Singapore’s dating scene is polished, efficient, and respectful. Singles here tend to value stability, strong family ties, and steady emotional compatibility.

The city’s high safety standards and multicultural communities make it easy to enjoy quality dates while staying comfortable and secure. Elovia Love helps connect you with profiles that are serious about commitment and long-term relationships.`
  },
  dateSpots: [
    {
      name: 'Marina Bay Waterfront',
      area: 'Marina Bay',
      description: 'A scenic evening walk with city skyline views, Gardens by the Bay, and elegant dining options.',
      atmosphere: 'Iconic, romantic, modern',
      idealFor: 'Evening dates, premium meetups',
      safety: 'Very safe with strong patrol presence',
      nearby: 'Gardens by the Bay, Merlion Park',
      transport: 'Bayfront or Raffles Place MRT',
      tip: 'Visit after sunset for the light show and cooler weather.'
    },
    {
      name: 'Botanic Gardens Stroll',
      area: 'Orchard Road',
      description: 'A quiet and green escape in the heart of the city, perfect for meaningful conversations and relaxed walking dates.',
      atmosphere: 'Serene, lush, romantic',
      idealFor: 'Nature lovers, daytime dates',
      safety: 'Safe and family-friendly',
      nearby: 'Orchard Road shopping area',
      transport: 'Botanic Gardens MRT',
      tip: 'Bring a picnic blanket and enjoy the outdoor gardens.'
    },
    {
      name: 'Clarke Quay Dinner',
      area: 'Riverside',
      description: 'A vibrant riverside area with bars, restaurants, and a glowing nighttime atmosphere.',
      atmosphere: 'Energetic, stylish, fun',
      idealFor: 'Dinner dates, evening meetups',
      safety: 'Safe and bustling',
      nearby: 'Boat Quay, Marina Bay',
      transport: 'Clarke Quay MRT',
      tip: 'Choose a quieter restaurant if you want a more intimate conversation.'
    },
    {
      name: 'Tiong Bahru Coffee Date',
      area: 'Tiong Bahru',
      description: 'A charming neighborhood with independent cafes, bakeries, and a relaxed atmosphere.',
      atmosphere: 'Cozy, quaint, creative',
      idealFor: 'Coffee lovers, artful couples',
      safety: 'Very safe and walkable',
      nearby: 'Tiong Bahru Market, art murals',
      transport: 'Tiong Bahru MRT',
      tip: 'Explore the local bookshop or bakery after coffee.'
    }
  ],
  popularAreas: [
    { name: 'Orchard Road', description: 'Retail and dining destination with upscale meeting spots.' },
    { name: 'Marina Bay', description: 'Iconic waterfront area with premium restaurants and views.' },
    { name: 'Tiong Bahru', description: 'Hip neighborhood with cafes and relaxed date venues.' },
    { name: 'Holland Village', description: 'Casual, international dining and nightlife options.' },
    { name: 'Sentosa', description: 'Beach and resort-style experiences for special dates.' }
  ],
  datingTips: [
    {
      title: 'Choose Clean, Comfortable Venues',
      content: 'Singapore singles expect neat, polished locations and considerate conversation.'
    },
    {
      title: 'Be Punctual',
      content: 'Timeliness is valued in Singapore and shows respect for your date’s time.'
    },
    {
      title: 'Stay Safe with Public Transport',
      content: 'The MRT is efficient, safe, and ideal for getting around the city on a first date.'
    },
    {
      title: 'Dress Smart Casual',
      content: 'A neat and comfortable outfit works well for most Singapore date spots.'
    },
    {
      title: 'Be Respectful of Boundaries',
      content: 'Respectful behavior and clear communication help build trust quickly.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in Singapore',
    content: `Singapore is one of the world’s safest cities, but smart choices still matter for first dates.

**Meet in public places** like cafes, waterfront areas, or gardens.
**Share your plans** with someone you trust before the date.
**Use trusted transport** like MRT trains or licensed ride services.
**Avoid secluded spots** especially after dark.
**Verify your match** on Elovia Love prior to meeting in person.`
  },
  faqs: [
    { question: 'Is dating in Singapore formal?', answer: 'Many singles prefer a respectful, polite approach, but there are also casual and relaxed date options.' },
    { question: 'Are outdoor dates common in Singapore?', answer: 'Yes, parks and waterfront locations are popular for daytime dates and leisurely conversations.' },
    { question: 'How do I meet serious singles in Singapore?', answer: 'Choose verified profiles, be honest about your intentions, and connect with people who want long-term relationships.' },
    { question: 'What should I wear on a first date in Singapore?', answer: 'Smart casual is a safe choice—clean, comfortable, and appropriate for the venue.' }
  ],
  nearbyCities: [
    { name: 'Johor Bahru', slug: 'johor-bahru', distance: '30 km' },
    { name: 'Batam', slug: 'batam', distance: '160 km' },
    { name: 'Bintan', slug: 'bintan', distance: '200 km' },
    { name: 'Kuala Lumpur', slug: 'kuala-lumpur', distance: '350 km' }
  ]
};

const Singapore = () => {
  return <CityPage data={singaporeData} />;
};

export default Singapore;
