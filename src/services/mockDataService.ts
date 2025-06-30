import { Disaster, NewsArticle, TourismSpot, DisasterType, NewsCategory, TourismCategory } from '../types/data';
import { US_STATES } from '../data/states';

// Comprehensive data generation for all US states
export const generateMockData = () => {
  const disasters: Disaster[] = [];
  const news: NewsArticle[] = [];
  const tourism: TourismSpot[] = [];

  // Generate disasters for each state
  Object.entries(US_STATES).forEach(([stateCode, stateInfo]) => {
    // Generate 3-8 disasters per state
    const disasterCount = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < disasterCount; i++) {
      const disaster = generateDisaster(stateCode, stateInfo, i);
      disasters.push(disaster);
    }

    // Generate 5-12 news articles per state
    const newsCount = Math.floor(Math.random() * 8) + 5;
    
    for (let i = 0; i < newsCount; i++) {
      const article = generateNewsArticle(stateCode, stateInfo, i);
      news.push(article);
    }

    // Generate 8-15 tourism spots per state
    const tourismCount = Math.floor(Math.random() * 8) + 8;
    
    for (let i = 0; i < tourismCount; i++) {
      const spot = generateTourismSpot(stateCode, stateInfo, i);
      tourism.push(spot);
    }
  });

  return { disasters, news, tourism };
};

// Generate realistic disaster data
const generateDisaster = (stateCode: string, stateInfo: any, index: number): Disaster => {
  const disasterTypes: DisasterType[] = ['earthquake', 'wildfire', 'hurricane', 'tornado', 'flood', 'drought', 'winter_storm', 'heat_wave'];
  
  // State-specific disaster probabilities
  const stateDisasterTypes: Record<string, DisasterType[]> = {
    'CA': ['wildfire', 'earthquake', 'drought', 'heat_wave'],
    'FL': ['hurricane', 'flood', 'heat_wave'],
    'TX': ['tornado', 'hurricane', 'drought', 'heat_wave', 'flood'],
    'AK': ['earthquake', 'winter_storm'],
    'AZ': ['heat_wave', 'drought', 'wildfire'],
    'NY': ['winter_storm', 'flood'],
  };

  const availableTypes = stateDisasterTypes[stateCode] || disasterTypes;
  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const statuses: ('active' | 'contained' | 'resolved')[] = ['active', 'contained', 'resolved'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Generate coordinates within state bounds
  const lat = stateInfo.bounds.south + Math.random() * (stateInfo.bounds.north - stateInfo.bounds.south);
  const lng = stateInfo.bounds.west + Math.random() * (stateInfo.bounds.east - stateInfo.bounds.west);

  const disasterTitles: Record<DisasterType, string[]> = {
    earthquake: [
      'Seismic Activity Detected',
      'Earthquake Shakes Region',
      'Tremors Felt Across Area',
      'Geological Survey Reports Quake'
    ],
    wildfire: [
      'Wildfire Burns Across County',
      'Forest Fire Threatens Communities',
      'Brush Fire Spreads Rapidly',
      'Firefighters Battle Blaze'
    ],
    hurricane: [
      'Hurricane Approaches Coast',
      'Tropical Storm Intensifies',
      'Coastal Areas Under Hurricane Watch',
      'Storm System Brings High Winds'
    ],
    tornado: [
      'Tornado Touches Down',
      'Severe Weather Spawns Twisters',
      'Tornado Warning Issued',
      'Funnel Cloud Spotted'
    ],
    flood: [
      'Flash Flooding Reported',
      'Rivers Overflow Banks',
      'Heavy Rains Cause Flooding',
      'Flood Waters Rise'
    ],
    drought: [
      'Drought Conditions Persist',
      'Water Restrictions Implemented',
      'Dry Conditions Continue',
      'Agricultural Impact from Drought'
    ],
    winter_storm: [
      'Winter Storm Brings Snow',
      'Blizzard Conditions Expected',
      'Ice Storm Warning',
      'Heavy Snow Accumulation'
    ],
    heat_wave: [
      'Extreme Heat Warning',
      'Record Temperatures Expected',
      'Heat Advisory Issued',
      'Dangerous Heat Conditions'
    ]
  };

  const titles = disasterTitles[type];
  const title = titles[Math.floor(Math.random() * titles.length)];

  const cities = getCitiesForState(stateCode);
  const city = cities[Math.floor(Math.random() * cities.length)];

  return {
    id: `disaster-${stateCode}-${index}`,
    type,
    title: `${title} - ${stateInfo.name}`,
    description: generateDisasterDescription(type, stateInfo.name, city),
    location: { lat, lng, state: stateCode, city },
    severity,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    affectedPeople: Math.floor(Math.random() * 100000) + 1000,
    economicImpact: Math.floor(Math.random() * 500000000) + 1000000,
    status,
    source: getDisasterSource(type)
  };
};

// Generate realistic news articles
const generateNewsArticle = (stateCode: string, stateInfo: any, index: number): NewsArticle => {
  const categories: NewsCategory[] = ['breaking', 'politics', 'business', 'technology', 'health', 'sports', 'entertainment', 'weather'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const lat = stateInfo.bounds.south + Math.random() * (stateInfo.bounds.north - stateInfo.bounds.south);
  const lng = stateInfo.bounds.west + Math.random() * (stateInfo.bounds.east - stateInfo.bounds.west);

  const cities = getCitiesForState(stateCode);
  const city = cities[Math.floor(Math.random() * cities.length)];

  const newsTemplates: Record<NewsCategory, { titles: string[], sources: string[] }> = {
    breaking: {
      titles: [
        'Major Infrastructure Project Announced',
        'Emergency Services Respond to Incident',
        'State Officials Address Public Safety',
        'Breaking: Local Government Makes Statement'
      ],
      sources: ['Local News 24', 'State Tribune', 'Breaking News Network', 'Regional Reporter']
    },
    politics: {
      titles: [
        'Governor Signs New Legislation',
        'State Senate Passes Important Bill',
        'Local Elections Show Voter Turnout',
        'Political Rally Draws Large Crowd'
      ],
      sources: ['Political Times', 'State Capitol News', 'Government Watch', 'Policy Report']
    },
    business: {
      titles: [
        'Major Corporation Expands Operations',
        'Local Business Receives Investment',
        'Economic Development Project Launched',
        'New Jobs Created in Manufacturing'
      ],
      sources: ['Business Journal', 'Economic Times', 'Industry Report', 'Commerce Daily']
    },
    technology: {
      titles: [
        'Tech Company Opens New Facility',
        'Innovation Hub Attracts Startups',
        'Digital Infrastructure Upgraded',
        'Research University Announces Breakthrough'
      ],
      sources: ['Tech Today', 'Innovation News', 'Digital Report', 'Science & Tech']
    },
    health: {
      titles: [
        'New Medical Center Opens',
        'Health Department Issues Guidelines',
        'Medical Research Shows Progress',
        'Public Health Initiative Launched'
      ],
      sources: ['Health News', 'Medical Journal', 'Wellness Report', 'Healthcare Today']
    },
    sports: {
      titles: [
        'Local Team Wins Championship',
        'New Sports Facility Announced',
        'Athletic Program Receives Funding',
        'Professional Team Signs New Player'
      ],
      sources: ['Sports Network', 'Athletic Report', 'Game Day News', 'Sports Tribune']
    },
    entertainment: {
      titles: [
        'Music Festival Comes to Town',
        'New Theater Production Opens',
        'Celebrity Visits Local Venue',
        'Arts Center Receives Grant'
      ],
      sources: ['Entertainment Weekly', 'Arts & Culture', 'Show Business', 'Cultural Times']
    },
    weather: {
      titles: [
        'Weather Service Issues Advisory',
        'Seasonal Forecast Released',
        'Climate Data Shows Trends',
        'Meteorologists Track Storm System'
      ],
      sources: ['Weather Channel', 'Climate Report', 'Meteorology News', 'Weather Service']
    }
  };

  const template = newsTemplates[category];
  const title = template.titles[Math.floor(Math.random() * template.titles.length)];
  const source = template.sources[Math.floor(Math.random() * template.sources.length)];

  // Ensure trending is properly set as boolean
  const trending = Math.random() > 0.7; // 30% chance of being trending

  return {
    id: `news-${stateCode}-${index}`,
    title: `${title} in ${stateInfo.name}`,
    description: generateNewsDescription(category, stateInfo.name, city),
    content: 'Full article content would be available here...',
    url: `https://example.com/news/${stateCode}-${index}`,
    imageUrl: getNewsImage(category),
    publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    source,
    author: generateAuthorName(),
    location: { lat, lng, state: stateCode, city },
    category,
    trending, // Fixed: ensure this is always a boolean
    localRelevance: Math.floor(Math.random() * 10) + 1
  };
};

// Generate realistic tourism spots
const generateTourismSpot = (stateCode: string, stateInfo: any, index: number): TourismSpot => {
  const categories: TourismCategory[] = [
    'national_park', 'monument', 'museum', 'beach', 'mountain', 
    'city_attraction', 'historical_site', 'entertainment', 'shopping', 'restaurant'
  ];
  
  // State-specific tourism preferences
  const statePreferences: Record<string, TourismCategory[]> = {
    'CA': ['beach', 'national_park', 'entertainment', 'city_attraction'],
    'FL': ['beach', 'entertainment', 'city_attraction'],
    'NY': ['museum', 'city_attraction', 'historical_site', 'entertainment'],
    'TX': ['historical_site', 'entertainment', 'restaurant'],
    'AZ': ['national_park', 'mountain', 'historical_site'],
    'AK': ['national_park', 'mountain'],
  };

  const availableCategories = statePreferences[stateCode] || categories;
  const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  
  const lat = stateInfo.bounds.south + Math.random() * (stateInfo.bounds.north - stateInfo.bounds.south);
  const lng = stateInfo.bounds.west + Math.random() * (stateInfo.bounds.east - stateInfo.bounds.west);

  const cities = getCitiesForState(stateCode);
  const city = cities[Math.floor(Math.random() * cities.length)];

  const tourismTemplates: Record<TourismCategory, { names: string[], descriptions: string[] }> = {
    national_park: {
      names: ['State Nature Reserve', 'Wildlife Sanctuary', 'National Forest', 'State Park'],
      descriptions: [
        'Pristine wilderness area with hiking trails and wildlife viewing opportunities.',
        'Protected natural habitat featuring diverse ecosystems and scenic landscapes.',
        'Outdoor recreation destination with camping, fishing, and nature programs.'
      ]
    },
    monument: {
      names: ['Historic Monument', 'Memorial Site', 'Cultural Landmark', 'Heritage Site'],
      descriptions: [
        'Significant historical landmark commemorating important events and figures.',
        'Cultural monument representing the heritage and history of the region.',
        'Memorial site honoring those who contributed to local and national history.'
      ]
    },
    museum: {
      names: ['History Museum', 'Art Gallery', 'Science Center', 'Cultural Museum'],
      descriptions: [
        'Educational institution showcasing local history, art, and cultural artifacts.',
        'Interactive museum featuring exhibits on science, technology, and innovation.',
        'Cultural center preserving and displaying regional heritage and traditions.'
      ]
    },
    beach: {
      names: ['Coastal Beach', 'Waterfront Park', 'Seaside Resort', 'Marine Recreation Area'],
      descriptions: [
        'Beautiful sandy beach perfect for swimming, sunbathing, and water sports.',
        'Scenic coastal area with pristine waters and recreational facilities.',
        'Popular beach destination offering family-friendly activities and amenities.'
      ]
    },
    mountain: {
      names: ['Mountain Peak', 'Scenic Overlook', 'Alpine Resort', 'Mountain Trail'],
      descriptions: [
        'Majestic mountain offering breathtaking views and hiking opportunities.',
        'Scenic mountain destination perfect for outdoor recreation and photography.',
        'Alpine environment with trails, wildlife, and stunning natural beauty.'
      ]
    },
    city_attraction: {
      names: ['Downtown District', 'Urban Plaza', 'City Center', 'Metropolitan Area'],
      descriptions: [
        'Vibrant urban area featuring shopping, dining, and entertainment options.',
        'Historic downtown district with architectural landmarks and cultural venues.',
        'Modern city center offering diverse attractions and urban experiences.'
      ]
    },
    historical_site: {
      names: ['Historic District', 'Heritage Building', 'Colonial Site', 'Archaeological Site'],
      descriptions: [
        'Well-preserved historical site showcasing architectural and cultural heritage.',
        'Important historical location with guided tours and educational programs.',
        'Heritage site representing significant periods in regional history.'
      ]
    },
    entertainment: {
      names: ['Entertainment Complex', 'Amusement Park', 'Theater District', 'Recreation Center'],
      descriptions: [
        'Family entertainment destination with rides, games, and attractions.',
        'Cultural entertainment venue featuring live performances and shows.',
        'Recreation complex offering various activities and entertainment options.'
      ]
    },
    shopping: {
      names: ['Shopping Center', 'Retail District', 'Marketplace', 'Commercial Plaza'],
      descriptions: [
        'Premier shopping destination with diverse retail stores and boutiques.',
        'Local marketplace featuring unique shops and artisan products.',
        'Modern shopping complex with dining, entertainment, and retail options.'
      ]
    },
    restaurant: {
      names: ['Fine Dining', 'Local Cuisine', 'Culinary Experience', 'Gourmet Restaurant'],
      descriptions: [
        'Award-winning restaurant featuring local ingredients and regional cuisine.',
        'Culinary destination known for innovative dishes and exceptional service.',
        'Popular dining establishment offering authentic local flavors and atmosphere.'
      ]
    }
  };

  const template = tourismTemplates[category];
  const nameTemplate = template.names[Math.floor(Math.random() * template.names.length)];
  const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];

  const amenities = generateAmenities(category);
  const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 to 5.0
  const entryFee = category === 'restaurant' ? undefined : Math.floor(Math.random() * 50);

  return {
    id: `tourism-${stateCode}-${index}`,
    name: `${nameTemplate} - ${city}`,
    description,
    location: { lat, lng, state: stateCode, city },
    category,
    rating,
    visitorsPerYear: Math.floor(Math.random() * 1000000) + 10000,
    entryFee,
    openingHours: generateOpeningHours(category),
    website: `https://example.com/tourism/${stateCode}-${index}`,
    imageUrl: getTourismImage(category),
    amenities,
    bestTimeToVisit: generateBestTimeToVisit(stateCode)
  };
};

// Helper functions
const getCitiesForState = (stateCode: string): string[] => {
  const stateCities: Record<string, string[]> = {
    'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Oakland', 'Fresno'],
    'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'],
    'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee', 'Fort Lauderdale'],
    'NY': ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany', 'Yonkers'],
    'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale'],
    'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla'],
    'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover']
  };
  
  return stateCities[stateCode] || ['Capital City', 'Metro Area', 'Downtown', 'Suburban Area'];
};

const generateDisasterDescription = (type: DisasterType, stateName: string, city: string): string => {
  const descriptions: Record<DisasterType, string[]> = {
    earthquake: [
      `Seismic activity detected in the ${city} area with tremors felt across ${stateName}.`,
      `Geological survey reports earthquake activity affecting the ${city} region.`,
      `Ground shaking reported in ${city} and surrounding areas of ${stateName}.`
    ],
    wildfire: [
      `Wildfire burning in ${city} area threatens local communities and wildlife.`,
      `Fire crews responding to blaze near ${city} in ${stateName}.`,
      `Evacuation orders issued for areas around ${city} due to wildfire threat.`
    ],
    hurricane: [
      `Hurricane system approaching ${city} with high winds and heavy rain expected.`,
      `Coastal areas near ${city} under hurricane watch as storm intensifies.`,
      `Emergency preparations underway in ${city} ahead of hurricane landfall.`
    ],
    tornado: [
      `Tornado activity reported in ${city} area with damage to structures.`,
      `Severe weather system produces tornadoes near ${city}, ${stateName}.`,
      `Tornado warning issued for ${city} and surrounding counties.`
    ],
    flood: [
      `Heavy rainfall causes flooding in ${city} with roads and homes affected.`,
      `Flash flood warning issued for ${city} area due to rising water levels.`,
      `Flood conditions persist in ${city} following recent heavy precipitation.`
    ],
    drought: [
      `Drought conditions continue to affect ${city} and surrounding agricultural areas.`,
      `Water restrictions implemented in ${city} due to ongoing drought.`,
      `Agricultural impact reported in ${city} region from extended dry conditions.`
    ],
    winter_storm: [
      `Winter storm brings heavy snow and ice to ${city} area.`,
      `Blizzard conditions expected in ${city} with travel advisories issued.`,
      `Ice storm warning for ${city} region with power outages possible.`
    ],
    heat_wave: [
      `Extreme heat warning issued for ${city} with record temperatures expected.`,
      `Heat advisory in effect for ${city} area with health precautions recommended.`,
      `Dangerous heat conditions persist in ${city} region of ${stateName}.`
    ]
  };

  const options = descriptions[type];
  return options[Math.floor(Math.random() * options.length)];
};

const generateNewsDescription = (category: NewsCategory, stateName: string, city: string): string => {
  const descriptions: Record<NewsCategory, string[]> = {
    breaking: [
      `Major development in ${city} affects local community and regional interests.`,
      `Breaking news from ${city} as officials respond to emerging situation.`,
      `Significant event in ${city} draws attention from across ${stateName}.`
    ],
    politics: [
      `Political developments in ${stateName} impact policy and governance.`,
      `Legislative action in ${city} addresses key issues facing the state.`,
      `Government officials in ${stateName} announce new initiatives and programs.`
    ],
    business: [
      `Economic growth in ${city} creates new opportunities and employment.`,
      `Business expansion in ${stateName} strengthens regional economy.`,
      `Investment in ${city} infrastructure supports commercial development.`
    ],
    technology: [
      `Technology sector growth in ${city} attracts innovation and talent.`,
      `Digital infrastructure improvements in ${stateName} enhance connectivity.`,
      `Research and development in ${city} leads to technological breakthroughs.`
    ],
    health: [
      `Healthcare improvements in ${city} benefit community wellness programs.`,
      `Medical research in ${stateName} advances treatment and prevention.`,
      `Public health initiatives in ${city} address community health needs.`
    ],
    sports: [
      `Athletic achievements in ${city} bring recognition to ${stateName}.`,
      `Sports development in ${city} enhances recreational opportunities.`,
      `Professional sports in ${stateName} generate economic and cultural impact.`
    ],
    entertainment: [
      `Cultural events in ${city} showcase arts and entertainment offerings.`,
      `Entertainment industry growth in ${stateName} creates new venues and opportunities.`,
      `Arts and culture in ${city} contribute to community vibrancy and tourism.`
    ],
    weather: [
      `Weather patterns in ${city} affect regional conditions and activities.`,
      `Seasonal forecast for ${stateName} indicates changing weather conditions.`,
      `Climate monitoring in ${city} provides important environmental data.`
    ]
  };

  const options = descriptions[category];
  return options[Math.floor(Math.random() * options.length)];
};

const getDisasterSource = (type: DisasterType): string => {
  const sources: Record<DisasterType, string[]> = {
    earthquake: ['USGS', 'Geological Survey', 'Seismic Network'],
    wildfire: ['CAL FIRE', 'Forest Service', 'Fire Department'],
    hurricane: ['National Hurricane Center', 'Weather Service', 'NOAA'],
    tornado: ['Storm Prediction Center', 'Weather Service', 'Emergency Management'],
    flood: ['Flood Control', 'Weather Service', 'Emergency Management'],
    drought: ['Drought Monitor', 'Agricultural Department', 'Water Resources'],
    winter_storm: ['Weather Service', 'DOT', 'Emergency Management'],
    heat_wave: ['Weather Service', 'Health Department', 'Emergency Management']
  };

  const options = sources[type];
  return options[Math.floor(Math.random() * options.length)];
};

const generateAuthorName = (): string => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

const getNewsImage = (category: NewsCategory): string => {
  const imageIds: Record<NewsCategory, number[]> = {
    breaking: [1181467, 1181472, 1181475],
    politics: [1550337, 1550340, 1550345],
    business: [416405, 416320, 416430],
    technology: [373543, 373547, 373551],
    health: [40568, 40570, 40575],
    sports: [274422, 274425, 274430],
    entertainment: [1763075, 1763080, 1763085],
    weather: [1118873, 1118875, 1118880]
  };

  const ids = imageIds[category];
  const imageId = ids[Math.floor(Math.random() * ids.length)];
  return `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=800`;
};

const getTourismImage = (category: TourismCategory): string => {
  const imageIds: Record<TourismCategory, number[]> = {
    national_park: [33041, 33045, 33050],
    monument: [64271, 64275, 64280],
    museum: [2747449, 2747450, 2747455],
    beach: [457882, 457885, 457890],
    mountain: [618833, 618835, 618840],
    city_attraction: [374710, 374715, 374720],
    historical_site: [1796730, 1796735, 1796740],
    entertainment: [1763075, 1763080, 1763085],
    shopping: [264636, 264640, 264645],
    restaurant: [262978, 262980, 262985]
  };

  const ids = imageIds[category];
  const imageId = ids[Math.floor(Math.random() * ids.length)];
  return `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=800`;
};

const generateAmenities = (category: TourismCategory): string[] => {
  const amenityOptions: Record<TourismCategory, string[]> = {
    national_park: ['Hiking Trails', 'Visitor Center', 'Camping', 'Wildlife Viewing', 'Picnic Areas', 'Gift Shop'],
    monument: ['Guided Tours', 'Visitor Center', 'Gift Shop', 'Audio Guide', 'Parking', 'Restrooms'],
    museum: ['Exhibitions', 'Gift Shop', 'Cafeteria', 'Audio Guide', 'Parking', 'Accessibility'],
    beach: ['Swimming', 'Lifeguards', 'Restrooms', 'Parking', 'Snack Bar', 'Beach Rentals'],
    mountain: ['Hiking Trails', 'Scenic Views', 'Parking', 'Restrooms', 'Picnic Areas', 'Wildlife'],
    city_attraction: ['Tours', 'Shopping', 'Dining', 'Parking', 'Public Transit', 'Entertainment'],
    historical_site: ['Guided Tours', 'Museum', 'Gift Shop', 'Parking', 'Educational Programs', 'Accessibility'],
    entertainment: ['Shows', 'Dining', 'Parking', 'Accessibility', 'Gift Shop', 'Group Rates'],
    shopping: ['Retail Stores', 'Dining', 'Parking', 'Entertainment', 'Services', 'Events'],
    restaurant: ['Fine Dining', 'Bar', 'Reservations', 'Private Events', 'Catering', 'Outdoor Seating']
  };

  const available = amenityOptions[category];
  const count = Math.floor(Math.random() * 4) + 3; // 3-6 amenities
  const selected = [];
  
  for (let i = 0; i < count && i < available.length; i++) {
    const amenity = available[Math.floor(Math.random() * available.length)];
    if (!selected.includes(amenity)) {
      selected.push(amenity);
    }
  }
  
  return selected;
};

const generateOpeningHours = (category: TourismCategory): string => {
  const hours: Record<TourismCategory, string[]> = {
    national_park: ['24/7', 'Dawn to Dusk', '6:00 AM - 8:00 PM'],
    monument: ['9:00 AM - 5:00 PM', '10:00 AM - 6:00 PM', '8:00 AM - 4:00 PM'],
    museum: ['10:00 AM - 5:00 PM', '9:00 AM - 6:00 PM', '11:00 AM - 4:00 PM'],
    beach: ['24/7', 'Dawn to Dusk', '6:00 AM - 10:00 PM'],
    mountain: ['24/7', 'Dawn to Dusk', '5:00 AM - 9:00 PM'],
    city_attraction: ['24/7', '9:00 AM - 10:00 PM', '10:00 AM - 8:00 PM'],
    historical_site: ['9:00 AM - 5:00 PM', '10:00 AM - 4:00 PM', '8:00 AM - 6:00 PM'],
    entertainment: ['7:00 PM - 11:00 PM', '6:00 PM - 12:00 AM', 'Varies by Show'],
    shopping: ['10:00 AM - 9:00 PM', '9:00 AM - 10:00 PM', '11:00 AM - 8:00 PM'],
    restaurant: ['11:00 AM - 10:00 PM', '5:00 PM - 11:00 PM', '12:00 PM - 9:00 PM']
  };

  const options = hours[category];
  return options[Math.floor(Math.random() * options.length)];
};

const generateBestTimeToVisit = (stateCode: string): string[] => {
  const stateTimes: Record<string, string[]> = {
    'CA': ['Spring', 'Fall'],
    'FL': ['Winter', 'Spring'],
    'TX': ['Spring', 'Fall'],
    'NY': ['Summer', 'Fall'],
    'AZ': ['Winter', 'Spring'],
    'AK': ['Summer'],
    'AL': ['Spring', 'Fall']
  };

  return stateTimes[stateCode] || ['Spring', 'Summer', 'Fall'];
};