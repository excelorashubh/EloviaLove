import CityPage from '../../components/city/CityPage';

const sydneyData = {
  city: 'Sydney',
  country: 'Australia',
  slug: 'sydney',
  metaTitle: 'Dating in Sydney — Meet Verified Singles | Elovia Love',
  metaDescription: 'Find meaningful relationships in Sydney with verified local singles, safe date ideas, and lifestyle-focused matchmaking on Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Couple enjoying a date in Sydney with the Opera House in view',
  introduction: {
    title: 'Dating in Sydney – Meet Ambitious Singles by the Harbour',
    content: `Sydney blends spectacular waterfront views with a laid-back lifestyle and busy urban culture. From Bondi Beach to CBD cafes, the city is full of authentic opportunities for serious relationships.

Elovia Love helps Sydney singles connect with verified matches who value honesty, career balance, and enjoyment of life. Whether it’s a walk along the harbour or coffee in Surry Hills, our platform helps you meet people who want more than just a casual meetup.`
  },
  whyUnique: {
    title: 'Why Dating in Sydney Feels Fresh',
    content: `Sydney dating is vibrant and relaxed, with an emphasis on outdoors, culture, and shared experiences. Singles here appreciate honest communication, active lifestyles, and a partner who can enjoy both city nights and beach weekends.

The city’s mix of professionals, creatives, and global residents makes it easier to find someone who shares your energy and values. Elovia Love helps narrow the noise so you can focus on real, verified connections.`
  },
  dateSpots: [
    {
      name: 'Bondi Beach Walk',
      area: 'Eastern Suburbs',
      description: 'A classic seaside date with coastal views, cafes, and a relaxed beachside vibe.',
      atmosphere: 'Sunny, relaxed, scenic',
      idealFor: 'Daytime dates, beach lovers',
      safety: 'Very safe during the day',
      nearby: 'Bondi Icebergs, Bondi Pavilion',
      transport: 'Bus routes from Bondi Junction',
      tip: 'Arrive early to avoid crowds and enjoy a peaceful walk.'
    },
    {
      name: 'Royal Botanic Garden Picnic',
      area: 'Sydney CBD',
      description: 'A green oasis in the city center, perfect for a laid-back picnic and pleasant conversation.',
      atmosphere: 'Calm, natural, intimate',
      idealFor: 'Relaxed dates, nature lovers',
      safety: 'Safe and family-friendly',
      nearby: 'Sydney Opera House, Circular Quay',
      transport: 'Circular Quay station',
      tip: 'Bring a blanket and enjoy views of the harbour.'
    },
    {
      name: 'Surry Hills Café Date',
      area: 'Surry Hills',
      description: 'A creative neighborhood filled with artisanal cafes, restaurants, and boutique shops.',
      atmosphere: 'Trendy, cozy, friendly',
      idealFor: 'Food lovers, creative individuals',
      safety: 'Safe and walkable',
      nearby: 'Central station, Crown Street',
      transport: 'Bus or train to Central station',
      tip: 'Choose a quieter cafe off the main street for better conversation.'
    },
    {
      name: 'Sydney Harbour Sunset',
      area: 'Circular Quay',
      description: 'Watch the sunset over the harbour with iconic views of the Opera House and Harbour Bridge.',
      atmosphere: 'Romantic, scenic, memorable',
      idealFor: 'Evening dates, special moments',
      safety: 'Very safe and popular with visitors',
      nearby: 'The Rocks, Opera Bar',
      transport: 'Circular Quay station',
      tip: 'Arrive early to find a good spot before the crowds gather.'
    }
  ],
  popularAreas: [
    { name: 'Surry Hills', description: 'A fashionable area with cafes, bars, and a creative energy.' },
    { name: 'Newtown', description: 'An eclectic neighborhood with artsy vibes and independent venues.' },
    { name: 'Bondi', description: 'Beachside living and a relaxed lifestyle popular with young singles.' },
    { name: 'North Sydney', description: 'A quieter, professional district with harbour views and easy access.' },
    { name: 'Manly', description: 'A beachside suburb great for weekend outings and seaside dates.' }
  ],
  datingTips: [
    {
      title: 'Embrace Outdoors',
      content: 'Sydney singles often love outdoor dates, so choose parks, beaches, or harbour walks for natural connection.'
    },
    {
      title: 'Dress for the Weather',
      content: 'Sydney weather can be bright and breezy—bring a light layer for evenings by the water.'
    },
    {
      title: 'Choose Relaxed Venues',
      content: 'Start with cafes or waterfront walks before moving to more formal evening dinners.'
    },
    {
      title: 'Be Honest About Intentions',
      content: 'Sydney singles appreciate clarity and respect when discussing relationship goals.'
    },
    {
      title: 'Use Verified Matches',
      content: 'Verified profiles create greater trust and make early conversations easier.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in Sydney',
    content: `Sydney is friendly and approachable, but good safety habits help every date go smoothly.

**Meet in public venues** such as cafes, parks, or harbourside locations.
**Share your route** and check in with a friend before the date.
**Use trusted transport** like trains, buses, or rideshares.
**Avoid isolated areas** after dark and stay where there are other people.
**Verify your match** through Elovia Love before meeting in person.`
  },
  faqs: [
    { question: 'What is the best time for a first date in Sydney?', answer: 'Late afternoon or early evening is ideal for enjoying the harbour and mild weather.' },
    { question: 'Are beach dates common in Sydney?', answer: 'Yes, many Sydney singles enjoy casual beach walks and seaside cafes for relaxed first meetings.' },
    { question: 'How do I find verified matches in Sydney?', answer: 'Use Elovia Love filters and focus on profiles with verification badges and serious relationship descriptions.' },
    { question: 'Is public transport good for dates in Sydney?', answer: 'Yes, trains and buses are reliable and make it easy to meet in central neighborhoods.' }
  ],
  nearbyCities: [
    { name: 'Newcastle', slug: 'newcastle', distance: '160 km' },
    { name: 'Wollongong', slug: 'wollongong', distance: '85 km' },
    { name: 'Blue Mountains', slug: 'blue-mountains', distance: '90 km' },
    { name: 'Central Coast', slug: 'central-coast', distance: '85 km' }
  ]
};

const Sydney = () => {
  return <CityPage data={sydneyData} />;
};

export default Sydney;
