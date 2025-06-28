export interface Catastrophe {
  id: string;
  type: CatastropheType;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  affectedPeople?: number;
  economicImpact?: number;
  status: 'active' | 'contained' | 'resolved';
}

export type CatastropheType = 'earthquake' | 'fire' | 'flood' | 'hurricane' | 'tornado' | 'volcano' | 'accident' | 'drought' | 'landslide';

export interface FilterState {
  types: CatastropheType[];
  severities: ('low' | 'medium' | 'high' | 'critical')[];
  dateRange: {
    start: string;
    end: string;
  };
  showActive: boolean;
}