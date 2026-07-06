import CityPage from '../../components/city/CityPage';

const chennaiData = {
  city: 'Chennai',
  state: 'Tamil Nadu',
  slug: 'chennai',
  metaTitle: 'Dating in Chennai — Meet Genuine Singles | Elovia Love',
  metaDescription: 'Discover meaningful relationships in Chennai with verified local singles, safe date ideas, and personalized matchmaking by Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1534351590660-768d1bcd7d0d?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Couple walking near Marina Beach in Chennai',
  introduction: {
    title: 'Dating in Chennai – Find Respectful Matches in the Cultural Capital',
    content: `Chennai blends tradition with modern living. The city’s respectful dating culture values family, education, and thoughtful commitment, making it an ideal place for singles searching for serious relationships.

Elovia Love helps Chennai singles connect with verified profiles who are ready for meaningful conversations, safe dates, and long-term compatibility. From beachside coffee chats to traditional festival meetups, there are many ways to build a strong connection.`
  },
  whyUnique: {
    title: 'Why Chennai Dating Feels Balanced',
    content: `Dating in Chennai is often centered on mutual respect, steady progress, and cultural understanding. The city’s social scene includes elegant beaches, cultural events, and family-oriented hangouts, which supports deep relationship-building.

Chennai singles value authenticity, good conversation, and a partner who understands both career goals and family expectations. This makes Elovia Love a strong fit for those who want a relationship with heart and stability.`
  },
  dateSpots: [
    {
      name: 'Marina Beach Walk',
      area: 'Marina',
      description: 'A classic Chennai date idea with a long coastal walk, local snacks, and sunset views over the Bay of Bengal.',
      atmosphere: 'Relaxed, refreshing, scenic',
      idealFor: 'First dates, evening conversations, casual outings',
      safety: 'Best during late afternoon and early evening',
      nearby: 'Ice cream stalls, lighthouse area',
      transport: 'Auto or cab across the city',
      tip: 'Bring a light jacket for the sea breeze and avoid very late hours.'
    },
    {
      name: 'Mylapore Temple Visit',
      area: 'Mylapore',
      description: 'A culturally rich date that offers traditional charm, temple architecture, and nearby cafes for a quiet conversation afterward.',
      atmosphere: 'Cultural, calm, respectful',
      idealFor: 'Values-driven singles, morning dates',
      safety: 'Safe and popular with locals',
      nearby: 'Express Avenue, San Thome Basilica',
      transport: 'Auto or local bus',
      tip: 'Pair the temple visit with a filtered coffee at a nearby traditional cafe.'
    },
    {
      name: 'Besant Nagar Café Hop',
      area: 'Besant Nagar',
      description: 'Spend time at cozy cafes near the beach and enjoy laid-back conversations with a vibrant, creative crowd.',
      atmosphere: 'Casual, hip, friendly',
      idealFor: 'Young professionals, coffee lovers',
      safety: 'Safe and well-frequented',
      nearby: 'Elliot’s Beach, Theosophical Society',
      transport: 'Auto or cab from central Chennai',
      tip: 'Choose quieter cafes for a more meaningful first date.'
    },
    {
      name: 'DakshinaChitra and Cultural Walk',
      area: 'Muttukadu',
      description: 'Explore traditional Tamil arts, crafts, and heritage homes for a memorable cultural day date.',
      atmosphere: 'Educational, charming, unique',
      idealFor: 'Culture lovers, long dates',
      safety: 'Safe with guided tours',
      nearby: 'Muttukadu backwaters',
      transport: 'Cab from city center',
      tip: 'Book tickets in advance on weekends to avoid crowds.'
    }
  ],
  popularAreas: [
    { name: 'Anna Nagar', description: 'A residential and retail hub with elegant cafes and spacious parks.' },
    { name: 'Adyar', description: 'A green neighborhood near the river that appeals to educated, career-minded singles.' },
    { name: 'T Nagar', description: 'Chennai’s busy shopping district with lively restaurants and meet-up spots.' },
    { name: 'Velachery', description: 'A growing suburb with modern malls and easy connectivity.' },
    { name: 'Nungambakkam', description: 'Popular with young professionals and college students.' }
  ],
  datingTips: [
    {
      title: 'Choose Public Venues',
      content: 'Start with cafes, beach promenades, or malls where conversation flows easily and both people feel comfortable.'
    },
    {
      title: 'Be Respectful of Culture',
      content: 'Chennai singles often value tradition and decorum, especially in early conversations and first meetings.'
    },
    {
      title: 'Enjoy Filter Coffee',
      content: 'Sharing a coffee at a local hole-in-the-wall cafe can be a charming way to connect over simple pleasures.'
    },
    {
      title: 'Plan Around the Weather',
      content: 'Chennai can be hot, so choose indoor or seaside spots during the afternoon and aim for cooler evenings.'
    },
    {
      title: 'Share Your Intentions Clearly',
      content: 'If you are looking for a serious relationship, be honest and thoughtful about your goals early on.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in Chennai',
    content: `Chennai is one of India’s safer metros for dating, but it still pays to be careful and choose public locations.

**Always meet in public places** for initial dates like cafes, beaches, or popular shopping centers.
**Inform a friend** about your plans and share your location if possible.
**Use reliable transport** such as app-based cabs or autos with receipts.
**Avoid overly late night meetings** on the first few dates and choose well-lit routes.
**Verify your match** on the Elovia Love platform before meeting in person.`
  },
  faqs: [
    { question: 'What are the best first date ideas in Chennai?', answer: 'Marina Beach walk, Besant Nagar cafes, and cultural visits to Mylapore or DakshinaChitra are excellent first-date choices.' },
    { question: 'Is dating in Chennai conservative?', answer: 'Chennai dates can be more thoughtful and respectful, but the city also has a growing scene for young professionals seeking genuine relationships.' },
    { question: 'How can I find verified singles in Chennai?', answer: 'Use Elovia Love filters, complete your profile, and connect with profiles that show clear relationship intent.' },
    { question: 'Are evening beach dates safe?', answer: 'Yes, popular beaches like Marina and Elliot’s Beach are safe during early evenings when there are plenty of people around.' }
  ],
  nearbyCities: [
    { name: 'Pondicherry', slug: 'pondicherry', distance: '150 km' },
    { name: 'Bangalore', slug: 'bangalore', distance: '345 km' },
    { name: 'Coimbatore', slug: 'coimbatore', distance: '510 km' },
    { name: 'Vellore', slug: 'vellore', distance: '135 km' }
  ]
};

const Chennai = () => {
  return <CityPage data={chennaiData} />;
};

export default Chennai;
