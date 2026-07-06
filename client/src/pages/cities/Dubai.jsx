import CityPage from '../../components/city/CityPage';

const dubaiData = {
  city: 'Dubai',
  country: 'UAE',
  slug: 'dubai',
  metaTitle: 'Dating in Dubai — Meet Verified Singles | Elovia Love',
  metaDescription: 'Connect with verified singles in Dubai through secure dating, local date ideas, and safety guidance on Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Couple enjoying a date in Dubai with skyline views',
  introduction: {
    title: 'Dating in Dubai – Discover Real Connections in the UAE’s Most Vibrant City',
    content: `Dubai is a global hub where modern luxury meets multicultural energy. The city offers unique dating opportunities across stylish venues, waterfront promenades, and premium experience spaces.

Elovia Love helps Dubai singles connect with verified matches who are serious about long-term relationships, cultural respect, and safety. From fine dining to outdoor experiences, Dubai is a city where meaningful connections can flourish.`
  },
  whyUnique: {
    title: 'Why Dating in Dubai Feels Exclusive',
    content: `Dubai’s dating landscape is shaped by careful balance—respect for tradition, international lifestyles, and premium experiences. Singles here often seek a partner who understands ambition, cultural values, and modern goals.

Elovia Love helps you meet those who want real connection instead of casual engagement. The city’s stylish venues and dynamic social scene make it a compelling place to build a serious relationship.`
  },
  dateSpots: [
    {
      name: 'Dubai Marina Walk',
      area: 'Dubai Marina',
      description: 'A scenic waterfront promenade lined with restaurants, cafes, and beautiful evening views.',
      atmosphere: 'Luxurious, relaxed, scenic',
      idealFor: 'Evening dates, dinner meetups',
      safety: 'Very safe and well-patrolled',
      nearby: 'JBR Beach, Bluewaters Island',
      transport: 'Dubai Metro to DMCC or JLT',
      tip: 'Choose a terrace restaurant for a memorable city-light dinner.'
    },
    {
      name: 'La Mer Beach Visit',
      area: 'Jumeirah',
      description: 'A picturesque beachfront destination with colorful cafes, waterside views, and relaxed seaside energy.',
      atmosphere: 'Beachy, bright, casual',
      idealFor: 'Daytime dates, cafes by the sea',
      safety: 'Safe and family-friendly',
      nearby: 'Jumeirah Mosque, Madinat Jumeirah',
      transport: 'Taxi or ride-hailing service',
      tip: 'Visit in the late afternoon before the evening breeze picks up.'
    },
    {
      name: 'Alserkal Avenue Art Walk',
      area: 'Al Quoz',
      description: 'A creative hub for galleries, cafes, and contemporary art exhibitions, perfect for a cultured, conversation-rich date.',
      atmosphere: 'Artistic, modern, inspiring',
      idealFor: 'Creative professionals, art lovers',
      safety: 'Safe and secure',
      nearby: 'Al Quoz industrial district',
      transport: 'Taxi or ride-hailing service',
      tip: 'Explore a gallery and then enjoy coffee at a nearby café.'
    },
    {
      name: 'Dubai Garden Glow',
      area: 'Zabeel 3',
      description: 'A magical evening destination with glowing installations, interactive art, and romantic ambiance.',
      atmosphere: 'Enchanting, romantic, festive',
      idealFor: 'Evening dates, special outings',
      safety: 'Safe with lighting and security',
      nearby: 'Zabeel Park',
      transport: 'Public transport nearby',
      tip: 'Book tickets in advance for weekend evenings to avoid lines.'
    }
  ],
  popularAreas: [
    { name: 'Jumeirah', description: 'Beachside luxury with stylish cafes and waterfront views.' },
    { name: 'Downtown Dubai', description: 'City center with iconic landmarks and premium dining.' },
    { name: 'Dubai Marina', description: 'Modern waterfront living with restaurants and evening energy.' },
    { name: 'Business Bay', description: 'Professional neighborhood with sleek meeting spots and cafes.' },
    { name: 'Al Quoz', description: 'Art-focused district with galleries and relaxed cafes.' }
  ],
  datingTips: [
    {
      title: 'Respect Local Customs',
      content: 'Dubai values respectful behavior in public, so choose venues and conversation topics that fit the city’s cultural norms.'
    },
    {
      title: 'Choose Comfortable Timing',
      content: 'Avoid midday heat by planning evening or late-afternoon dates, especially outdoors.'
    },
    {
      title: 'Opt for Secure Venues',
      content: 'Dubai offers many secure malls, hotels, and cafes with a premium feel and excellent service.'
    },
    {
      title: 'Be Clear About Relationship Goals',
      content: 'Many Dubai singles appreciate honest communication about intentions and long-term compatibility.'
    },
    {
      title: 'Use Verified Profiles',
      content: 'Verified matches help build trust quickly when you are planning to meet someone new.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in Dubai',
    content: `Dubai is a safe city with high security standards, but good habits still matter.

**Meet in public places** such as upscale cafes, hotel lounges, or shopping destinations.
**Share your plans** with a trusted friend or family member.
**Use trusted transport** like taxis or ride-hailing services with GPS tracking.
**Avoid isolated areas** after dark and stick to busy, well-known locations.
**Confirm your match** through Elovia Love before meeting in person.`
  },
  faqs: [
    { question: 'Can I date in Dubai as an expat?', answer: 'Yes, many expats use Elovia Love to meet serious singles while respecting local culture and community expectations.' },
    { question: 'Is public dating common in Dubai?', answer: 'Public dating exists in Dubai, especially in safe, neutral spots like malls, hotels, and cafes.' },
    { question: 'What are good first date ideas in Dubai?', answer: 'Dubai Marina Walk, La Mer Beach, and Alserkal Avenue are excellent options for first dates.' },
    { question: 'Should I dress formally for a date in Dubai?', answer: 'Smart casual is usually best—clean, polished, and comfortable for the venue.' }
  ],
  nearbyCities: [
    { name: 'Abu Dhabi', slug: 'abu-dhabi', distance: '140 km' },
    { name: 'Sharjah', slug: 'sharjah', distance: '15 km' },
    { name: 'Ajman', slug: 'ajman', distance: '40 km' },
    { name: 'Ras Al Khaimah', slug: 'ras-al-khaimah', distance: '105 km' }
  ]
};

const Dubai = () => {
  return <CityPage data={dubaiData} />;
};

export default Dubai;
