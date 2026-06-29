export const globalStats = {
  countries: '50+',
  cities: '500+',
  verifiedMembers: '50,000+',
  conversations: '1M+',
  avgVerificationTime: '24-48 hours',
  responseRate: '85%'
};

export const featuredCountries = [
  { 
    name: 'India', 
    slug: 'india', 
    flag: '🇮🇳', 
    cities: 500,
    featured: true,
    description: 'Largest community with verified singles across 25 states'
  },
  { 
    name: 'United States', 
    slug: 'united-states', 
    flag: '🇺🇸', 
    cities: 50,
    description: 'Connect with singles in major US cities'
  },
  { 
    name: 'Canada', 
    slug: 'canada', 
    flag: '🇨🇦', 
    cities: 20,
    description: 'Find genuine connections across Canadian provinces'
  },
  { 
    name: 'United Kingdom', 
    slug: 'united-kingdom', 
    flag: '🇬🇧', 
    cities: 30,
    description: 'Meet verified singles throughout the UK'
  },
  { 
    name: 'Australia', 
    slug: 'australia', 
    flag: '🇦🇺', 
    cities: 15,
    description: 'Discover meaningful relationships down under'
  },
  { 
    name: 'United Arab Emirates', 
    slug: 'uae', 
    flag: '🇦🇪', 
    cities: 5,
    description: 'Connect with international singles in the UAE'
  },
  { 
    name: 'Singapore', 
    slug: 'singapore', 
    flag: '🇸🇬', 
    cities: 1,
    description: 'Find your match in the Lion City'
  },
  { 
    name: 'Germany', 
    slug: 'germany', 
    flag: '🇩🇪', 
    cities: 25,
    description: 'Serious relationships across German cities'
  },
  { 
    name: 'France', 
    slug: 'france', 
    flag: '🇫🇷', 
    cities: 20,
    description: 'Discover romance in France'
  },
  { 
    name: 'Japan', 
    slug: 'japan', 
    flag: '🇯🇵', 
    cities: 15,
    description: 'Connect with singles in Japan'
  },
  { 
    name: 'Brazil', 
    slug: 'brazil', 
    flag: '🇧🇷', 
    cities: 30,
    description: 'Find love in Brazilian cities'
  },
  { 
    name: 'Mexico', 
    slug: 'mexico', 
    flag: '🇲🇽', 
    cities: 20,
    description: 'Meet genuine singles in Mexico'
  },
  { 
    name: 'Nepal', 
    slug: 'nepal', 
    flag: '🇳🇵', 
    cities: 5,
    description: 'Connect with Nepali singles worldwide'
  },
  { 
    name: 'Bangladesh', 
    slug: 'bangladesh', 
    flag: '🇧🇩', 
    cities: 10,
    description: 'Find meaningful connections'
  },
  { 
    name: 'Malaysia', 
    slug: 'malaysia', 
    flag: '🇲🇾', 
    cities: 10,
    description: 'Discover relationships in Malaysia'
  },
  { 
    name: 'South Africa', 
    slug: 'south-africa', 
    flag: '🇿🇦', 
    cities: 15,
    description: 'Connect with South African singles'
  }
];

export const globalCities = [
  // India (largest market)
  { name: 'Mumbai', country: 'India', slug: 'mumbai', population: '25M', hasPage: true },
  { name: 'Delhi', country: 'India', slug: 'delhi', population: '32M', hasPage: true },
  { name: 'Bangalore', country: 'India', slug: 'bangalore', population: '14M', hasPage: true },
  { name: 'Hyderabad', country: 'India', slug: 'hyderabad', population: '11M', hasPage: false },
  { name: 'Chennai', country: 'India', slug: 'chennai', population: '11M', hasPage: false },
  { name: 'Kolkata', country: 'India', slug: 'kolkata', population: '15M', hasPage: true },
  
  // International
  { name: 'London', country: 'United Kingdom', slug: 'london', population: '9M', hasPage: false },
  { name: 'New York', country: 'United States', slug: 'new-york', population: '8M', hasPage: false },
  { name: 'Toronto', country: 'Canada', slug: 'toronto', population: '3M', hasPage: false },
  { name: 'Sydney', country: 'Australia', slug: 'sydney', population: '5M', hasPage: false },
  { name: 'Dubai', country: 'UAE', slug: 'dubai', population: '3M', hasPage: false },
  { name: 'Singapore', country: 'Singapore', slug: 'singapore', population: '6M', hasPage: false }
];

export const globalTestimonials = [
  {
    names: 'Priya & Arjun',
    location: 'Bangalore, India',
    story: 'We matched on Elovia Love and instantly connected over our love for travel and tech. The verification gave us confidence, and the AI matching was surprisingly accurate. Eight months later, we\'re engaged and planning our future together!',
    verified: true
  },
  {
    names: 'Aisha & Omar',
    location: 'Dubai, UAE',
    story: 'As expats in Dubai, finding someone who understood our cultural values was challenging. Elovia Love\'s filters helped us find each other. We\'re now planning our wedding and couldn\'t be happier with this platform.',
    verified: true
  },
  {
    names: 'Emily & James',
    location: 'Toronto, Canada',
    story: 'After years of unsuccessful dating app experiences, Elovia Love\'s focus on serious relationships was refreshing. We video called before our first date, and the rest is history. Found my forever person here!',
    verified: true
  },
  {
    names: 'Sophia & Daniel',
    location: 'Sydney, Australia',
    story: 'The safety features and verification process made all the difference. We both appreciated knowing we were talking to real people with serious intentions. Six months in and deeply in love!',
    verified: true
  },
  {
    names: 'Ananya & Rohan',
    location: 'Mumbai, India',
    story: 'Being working professionals with little time, Elovia Love\'s AI matching saved us from endless swiping. We found each other within two months and are now planning our engagement ceremony!',
    verified: true
  },
  {
    names: 'Li Wei & Mei',
    location: 'Singapore',
    story: 'We appreciated the platform\'s emphasis on compatibility and values. The detailed profiles helped us understand each other before meeting. Now we\'re building our life together in Singapore!',
    verified: true
  }
];

export const trustIndicators = [
  {
    icon: 'shield-check',
    title: 'Manual Profile Verification',
    description: 'Every profile reviewed by real humans with government ID checks'
  },
  {
    icon: 'users',
    title: 'Real Customer Support',
    description: '24/7 support team ready to help with any questions or concerns'
  },
  {
    icon: 'lock',
    title: 'Privacy Protection',
    description: 'Bank-grade encryption and strict privacy controls for your data'
  },
  {
    icon: 'message-circle',
    title: 'Secure Messaging',
    description: 'End-to-end encrypted conversations that stay private'
  },
  {
    icon: 'flag',
    title: 'Report & Block',
    description: 'Quick tools to report suspicious behavior and block unwanted contacts'
  },
  {
    icon: 'file-text',
    title: 'Community Guidelines',
    description: 'Clear rules ensuring respectful, meaningful interactions'
  },
  {
    icon: 'check-circle',
    title: 'Identity Verification',
    description: 'Multi-step verification process eliminates fake accounts'
  },
  {
    icon: 'database',
    title: 'Data Security',
    description: 'Your information protected with industry-leading security'
  },
  {
    icon: 'eye',
    title: 'Active Moderation',
    description: 'Dedicated team monitoring for safety violations'
  },
  {
    icon: 'shield',
    title: 'Transparent Policies',
    description: 'Clear terms, privacy policy, and safety guidelines'
  }
];
