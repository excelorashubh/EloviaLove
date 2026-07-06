import CityPage from '../../components/city/CityPage';

const londonData = {
  city: 'London',
  country: 'United Kingdom',
  slug: 'london',
  metaTitle: 'Dating in London — Meet Genuine Singles | Elovia Love',
  metaDescription: 'Discover verified singles in London with meaningful date ideas, safety guidance, and relationship-focused matchmaking on Elovia Love.',
  heroImage: 'https://images.unsplash.com/photo-1522098543979-ffc7f79d1f1b?w=1200&q=80&auto=format&fm=webp',
  heroAlt: 'Romantic evening in London with the city skyline',
  introduction: {
    title: 'Dating in London – Meet Verified Singles Across the Capital',
    content: `London is a global city where cultures meet, careers grow, and meaningful relationships are formed. From historic riverbanks to modern cultural neighborhoods, the city offers countless chances to connect with people who share your values.

Elovia Love supports London singles looking for serious relationships by matching verified profiles across the city’s favorite neighborhoods. Whether you prefer an art gallery date in Shoreditch or a riverside walk along the Thames, we help you find real connections.`
  },
  whyUnique: {
    title: 'Why London Dating Is Refreshingly Varied',
    content: `Dating in London is as diverse as the city itself. You can start with a casual coffee in Notting Hill, enjoy a museum date in South Kensington, or meet for a sunset picnic near Tower Bridge.

The London dating scene rewards thoughtful planning, meaningful conversations, and authenticity. With a mix of professionals, creatives, and global travelers, Elovia Love makes it easier to find someone who is serious about long-term commitment.`
  },
  dateSpots: [
    {
      name: 'South Bank Walk',
      area: 'River Thames',
      description: 'A scenic stroll along the river with street performers, riverside cafes, and iconic London views.',
      atmosphere: 'Casual, romantic, scenic',
      idealFor: 'First dates, evening walks, cultural outings',
      safety: 'Safe and well-lit during evenings',
      nearby: 'Shakespeare’s Globe, Tate Modern',
      transport: 'Waterloo or London Bridge stations',
      tip: 'Start near the London Eye and walk toward Tower Bridge for a memorable route.'
    },
    {
      name: 'Notting Hill Café date',
      area: 'Notting Hill',
      description: 'Charming cafes and quiet streets make Notting Hill perfect for relaxed conversations and a romantic atmosphere.',
      atmosphere: 'Charming, cozy, stylish',
      idealFor: 'Coffee lovers, creative couples',
      safety: 'Very safe and popular with locals',
      nearby: 'Portobello Road Market',
      transport: 'Notting Hill Gate station',
      tip: 'Plan a weekend morning brunch before exploring the market.'
    },
    {
      name: 'Hyde Park Picnic',
      area: 'Central London',
      description: 'A leisurely picnic in Hyde Park offers open green space, boat rides, and quiet corners for a comfortable daytime date.',
      atmosphere: 'Relaxed, nature-focused, romantic',
      idealFor: 'Daytime dates, nature lovers',
      safety: 'Safe and family-friendly',
      nearby: 'Kensington Gardens, Serpentine Lake',
      transport: 'Knightsbridge or Marble Arch stations',
      tip: 'Bring a blanket and stop by one of the park cafes for snacks.'
    },
    {
      name: 'Sky Garden Evening',
      area: 'Fenchurch Street',
      description: 'A refined evening date with city skyline views, indoor gardens, and elegant dining options.',
      atmosphere: 'Sophisticated, elevated, memorable',
      idealFor: 'Special dates, wow factor',
      safety: 'Secure and premium',
      nearby: 'The Gherkin, Tower of London',
      transport: 'Monument or London Bridge stations',
      tip: 'Book free tickets in advance and stay for sunset over the city.'
    }
  ],
  popularAreas: [
    { name: 'Shoreditch', description: 'Creative district with street art, cafes, and contemporary bars.' },
    { name: 'South Kensington', description: 'Elegant neighborhood with museums, galleries, and cultured dining.' },
    { name: 'Clapham', description: 'Lively area with parks, nightlife, and good cafes.' },
    { name: 'Camden', description: 'Bustling market atmosphere for adventurous and music-loving singles.' },
    { name: 'Richmond', description: 'Green spaces and riverside dates with a quieter London feel.' }
  ],
  datingTips: [
    {
      title: 'Use Public Transport',
      content: 'London’s Tube and bus network makes it easy to meet in convenient neighborhoods without travel stress.'
    },
    {
      title: 'Choose Timely Venues',
      content: 'Avoid late trains after your date by meeting closer to a Tube station or central hub.'
    },
    {
      title: 'Be Clear About Your Intentions',
      content: 'Many London singles appreciate honest conversation about relationship goals early on.'
    },
    {
      title: 'Bring a Light Layer',
      content: 'London weather changes quickly, so pack a jacket for riverside strolls and outdoor plans.'
    },
    {
      title: 'Pick a Shared Interest',
      content: 'Use cultural events, museum visits, or food markets as a shared activity for natural conversation.'
    }
  ],
  safetyGuide: {
    title: 'Dating Safety in London',
    content: `London is a busy and generally safe city, but it pays to stay alert, especially in crowded districts.

**Choose well-lit, populated locations** for first meetings, such as cafes or landmark areas.
**Share your route** with someone you trust before the date.
**Use official transport** like Uber, licensed black cabs, or the Tube after dark.
**Watch your belongings** in tourist-heavy areas and avoid isolated streets late at night.
**Confirm your match** through the Elovia Love platform before meeting in person.`
  },
  faqs: [
    { question: 'Is dating in London expensive?', answer: 'Not necessarily. Many great first-date options are free or low-cost, such as parks, walks, and markets.' },
    { question: 'Where are the best places to meet singles in London?', answer: 'Shoreditch, South Bank, Notting Hill, and Clapham attract professionals and creative singles.' },
    { question: 'Are online dates common in London?', answer: 'Yes, many Londoners use dating apps to meet serious matches and prefer verified profiles for safety.' },
    { question: 'Should I bring cash on a date?', answer: 'Most places accept cards, but it’s a good idea to carry a small amount of cash for markets or transport mishaps.' }
  ],
  nearbyCities: [
    { name: 'Brighton', slug: 'brighton', distance: '85 km' },
    { name: 'Oxford', slug: 'oxford', distance: '90 km' },
    { name: 'Cambridge', slug: 'cambridge', distance: '100 km' },
    { name: 'Windsor', slug: 'windsor', distance: '35 km' }
  ]
};

const London = () => {
  return <CityPage data={londonData} />;
};

export default London;
