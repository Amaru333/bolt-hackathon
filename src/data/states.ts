import { StateInfo } from '../types/data';

export const US_STATES: Record<string, StateInfo> = {
  'AL': {
    code: 'AL',
    name: 'Alabama',
    capital: 'Montgomery',
    population: 5024279,
    area: 52420,
    founded: '1819',
    nickname: 'Heart of Dixie',
    coordinates: { lat: 32.806671, lng: -86.791130 },
    bounds: { north: 35.008028, south: 30.144425, east: -84.888246, west: -88.473227 },
    economy: {
      gdp: 220.8,
      majorIndustries: ['Agriculture', 'Automotive', 'Aerospace', 'Steel'],
      unemploymentRate: 2.6
    },
    demographics: {
      medianAge: 39.2,
      medianIncome: 52035,
      educationLevel: 'High School'
    },
    climate: {
      averageTemp: 64,
      rainfall: 58,
      climate: 'Humid subtropical'
    }
  },
  'AK': {
    code: 'AK',
    name: 'Alaska',
    capital: 'Juneau',
    population: 733391,
    area: 665384,
    founded: '1959',
    nickname: 'Last Frontier',
    coordinates: { lat: 61.370716, lng: -152.404419 },
    bounds: { north: 71.538800, south: 54.775926, east: -129.992235, west: 179.148909 },
    economy: {
      gdp: 55.6,
      majorIndustries: ['Oil', 'Fishing', 'Tourism', 'Mining'],
      unemploymentRate: 6.1
    },
    demographics: {
      medianAge: 34.6,
      medianIncome: 77640,
      educationLevel: 'Some College'
    },
    climate: {
      averageTemp: 26,
      rainfall: 22,
      climate: 'Arctic and subarctic'
    }
  },
  'AZ': {
    code: 'AZ',
    name: 'Arizona',
    capital: 'Phoenix',
    population: 7151502,
    area: 113990,
    founded: '1912',
    nickname: 'Grand Canyon State',
    coordinates: { lat: 33.729759, lng: -111.431221 },
    bounds: { north: 37.004260, south: 31.332177, east: -109.045223, west: -114.816591 },
    economy: {
      gdp: 365.9,
      majorIndustries: ['Technology', 'Aerospace', 'Mining', 'Tourism'],
      unemploymentRate: 3.5
    },
    demographics: {
      medianAge: 38.5,
      medianIncome: 62055,
      educationLevel: 'Some College'
    },
    climate: {
      averageTemp: 60,
      rainfall: 13,
      climate: 'Desert'
    }
  },
  'CA': {
    code: 'CA',
    name: 'California',
    capital: 'Sacramento',
    population: 39538223,
    area: 163695,
    founded: '1850',
    nickname: 'Golden State',
    coordinates: { lat: 36.116203, lng: -119.681564 },
    bounds: { north: 42.009518, south: 32.534156, east: -114.131211, west: -124.409591 },
    economy: {
      gdp: 3353.2,
      majorIndustries: ['Technology', 'Entertainment', 'Agriculture', 'Tourism'],
      unemploymentRate: 4.2
    },
    demographics: {
      medianAge: 36.8,
      medianIncome: 80440,
      educationLevel: 'Some College'
    },
    climate: {
      averageTemp: 59,
      rainfall: 22,
      climate: 'Mediterranean'
    }
  },
  'FL': {
    code: 'FL',
    name: 'Florida',
    capital: 'Tallahassee',
    population: 21538187,
    area: 65758,
    founded: '1845',
    nickname: 'Sunshine State',
    coordinates: { lat: 27.766279, lng: -81.686783 },
    bounds: { north: 31.000888, south: 24.544245, east: -79.974306, west: -87.634938 },
    economy: {
      gdp: 1036.3,
      majorIndustries: ['Tourism', 'Agriculture', 'Aerospace', 'International Trade'],
      unemploymentRate: 2.6
    },
    demographics: {
      medianAge: 42.2,
      medianIncome: 59227,
      educationLevel: 'Some College'
    },
    climate: {
      averageTemp: 71,
      rainfall: 54,
      climate: 'Tropical and subtropical'
    }
  },
  'TX': {
    code: 'TX',
    name: 'Texas',
    capital: 'Austin',
    population: 29145505,
    area: 268596,
    founded: '1845',
    nickname: 'Lone Star State',
    coordinates: { lat: 31.054487, lng: -97.563461 },
    bounds: { north: 36.500704, south: 25.837377, east: -93.508292, west: -106.645646 },
    economy: {
      gdp: 2355.9,
      majorIndustries: ['Energy', 'Technology', 'Agriculture', 'Aerospace'],
      unemploymentRate: 3.4
    },
    demographics: {
      medianAge: 35.5,
      medianIncome: 64034,
      educationLevel: 'High School'
    },
    climate: {
      averageTemp: 65,
      rainfall: 28,
      climate: 'Varied'
    }
  },
  'NY': {
    code: 'NY',
    name: 'New York',
    capital: 'Albany',
    population: 20201249,
    area: 54555,
    founded: '1788',
    nickname: 'Empire State',
    coordinates: { lat: 42.165726, lng: -74.948051 },
    bounds: { north: 45.015865, south: 40.477399, east: -71.777491, west: -79.762152 },
    economy: {
      gdp: 1994.5,
      majorIndustries: ['Finance', 'Real Estate', 'Technology', 'Media'],
      unemploymentRate: 4.1
    },
    demographics: {
      medianAge: 39.0,
      medianIncome: 70457,
      educationLevel: 'Some College'
    },
    climate: {
      averageTemp: 45,
      rainfall: 41,
      climate: 'Continental'
    }
  }
};