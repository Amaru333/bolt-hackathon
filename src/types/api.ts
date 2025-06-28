export interface USGSEarthquake {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz?: number;
    url: string;
    detail: string;
    felt?: number;
    cdi?: number;
    mmi?: number;
    alert?: string;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst?: number;
    dmin?: number;
    rms: number;
    gap?: number;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  id: string;
}

export interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSEarthquake[];
}

export interface NASAFire {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: number;
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
}

export interface WeatherAlert {
  id: string;
  areaDesc: string;
  geocode: {
    FIPS6: string[];
    UGC: string[];
  };
  affectedZones: string[];
  references: unknown[];
  sent: string;
  effective: string;
  onset?: string;
  expires: string;
  ends?: string;
  status: string;
  messageType: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  sender: string;
  senderName: string;
  headline: string;
  description: string;
  instruction?: string;
  response: string;
  parameters: Record<string, unknown>;
}

export interface APIErrorData {
  source: string;
  error: string;
  timestamp: number;
}

export class APIError {
  source: string;
  error: string;
  timestamp: number;

  constructor(source: string, error: string) {
    this.source = source;
    this.error = error;
    this.timestamp = Date.now();
  }
}

export interface DataFetchStatus {
  earthquakes: "loading" | "success" | "error" | "idle";
  fires: "loading" | "success" | "error" | "idle";
  weather: "loading" | "success" | "error" | "idle";
  volcanoes: "loading" | "success" | "error" | "idle";
  tsunamis: "loading" | "success" | "error" | "idle";
  airQuality: "loading" | "success" | "error" | "idle";
  news: "loading" | "success" | "error" | "idle";
  lastUpdated: Record<string, number>;
  errors: APIErrorData[];
}
