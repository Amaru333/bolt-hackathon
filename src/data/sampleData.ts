import { Catastrophe } from '../types/catastrophe';

export const sampleCatastrophes: Catastrophe[] = [
  {
    id: '1',
    type: 'fire',
    title: 'California Wildfire Complex',
    description: 'Large wildfire complex affecting multiple counties in Northern California',
    location: {
      lat: 38.7783,
      lng: -122.4178,
      country: 'United States',
      region: 'California'
    },
    severity: 'high',
    date: '2024-03-15T08:30:00Z',
    affectedPeople: 15000,
    economicImpact: 250000000,
    status: 'active'
  },
  {
    id: '2',
    type: 'earthquake',
    title: 'M7.2 Earthquake',
    description: 'Major earthquake strikes off the coast of Japan',
    location: {
      lat: 38.2975,
      lng: 142.3731,
      country: 'Japan',
      region: 'Honshu'
    },
    severity: 'critical',
    date: '2024-03-14T14:20:00Z',
    affectedPeople: 200000,
    economicImpact: 500000000,
    status: 'resolved'
  },
  {
    id: '3',
    type: 'hurricane',
    title: 'Hurricane Maya',
    description: 'Category 3 hurricane approaching the Gulf Coast',
    location: {
      lat: 28.5383,
      lng: -81.3792,
      country: 'United States',
      region: 'Florida'
    },
    severity: 'high',
    date: '2024-03-16T12:00:00Z',
    affectedPeople: 500000,
    economicImpact: 800000000,
    status: 'active'
  },
  {
    id: '4',
    type: 'flood',
    title: 'Monsoon Flooding',
    description: 'Severe flooding in Kerala due to heavy monsoon rains',
    location: {
      lat: 10.8505,
      lng: 76.2711,
      country: 'India',
      region: 'Kerala'
    },
    severity: 'medium',
    date: '2024-03-13T06:15:00Z',
    affectedPeople: 75000,
    economicImpact: 100000000,
    status: 'contained'
  },
  {
    id: '5',
    type: 'volcano',
    title: 'Mount Etna Eruption',
    description: 'Volcanic activity increases at Mount Etna with lava flows',
    location: {
      lat: 37.7510,
      lng: 14.9934,
      country: 'Italy',
      region: 'Sicily'
    },
    severity: 'medium',
    date: '2024-03-12T22:45:00Z',
    affectedPeople: 25000,
    economicImpact: 50000000,
    status: 'active'
  },
  {
    id: '6',
    type: 'tornado',
    title: 'Oklahoma Tornado Outbreak',
    description: 'Multiple tornadoes touchdown across Oklahoma plains',
    location: {
      lat: 35.4676,
      lng: -97.5164,
      country: 'United States',
      region: 'Oklahoma'
    },
    severity: 'high',
    date: '2024-03-11T18:30:00Z',
    affectedPeople: 30000,
    economicImpact: 120000000,
    status: 'resolved'
  },
  {
    id: '7',
    type: 'accident',
    title: 'Industrial Chemical Spill',
    description: 'Chemical plant accident results in environmental contamination',
    location: {
      lat: 51.4934,
      lng: 0.0098,
      country: 'United Kingdom',
      region: 'London'
    },
    severity: 'medium',
    date: '2024-03-10T15:20:00Z',
    affectedPeople: 5000,
    economicImpact: 75000000,
    status: 'contained'
  },
  {
    id: '8',
    type: 'drought',
    title: 'East Africa Drought',
    description: 'Severe drought conditions affecting agricultural regions',
    location: {
      lat: -1.2921,
      lng: 36.8219,
      country: 'Kenya',
      region: 'Nairobi'
    },
    severity: 'critical',
    date: '2024-02-28T00:00:00Z',
    affectedPeople: 1000000,
    economicImpact: 300000000,
    status: 'active'
  }
];