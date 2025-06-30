import React, { useCallback, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, CircleMarker, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { ExternalLink, MapPin, Star, DollarSign, Users, Calendar } from 'lucide-react';
import { Disaster, NewsArticle, TourismSpot, ViewMode, ZoomLevel } from '../../types/data';
import { getDisasterIcon, getDisasterColor, getSeverityColor } from '../../utils/mapUtils';
import { getNewsIcon, getCategoryColor, formatTimeAgo } from '../../utils/newsUtils';
import { getTourismIcon, getRatingStars, formatPrice } from '../../utils/tourismUtils';
import { US_STATES } from '../../data/states';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  disasters: Disaster[];
  news: NewsArticle[];
  tourism: TourismSpot[];
  viewMode: ViewMode;
  selectedState: string | null;
  zoomLevel: ZoomLevel;
  onMapClick?: (lat: number, lng: number) => void;
  onStateSelect?: (stateCode: string) => void;
}

// Map click handler component
const MapClickHandler: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Zoom level tracker component
const ZoomTracker: React.FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoomend', handleZoom);
    handleZoom(); // Initial zoom level
    
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);
  
  return null;
};

// Heatmap cluster component
const HeatmapCluster: React.FC<{
  items: any[];
  type: 'disaster' | 'news' | 'tourism';
  bounds: { north: number; south: number; east: number; west: number };
}> = ({ items, type, bounds }) => {
  if (items.length === 0) return null;

  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;
  const intensity = Math.min(items.length / 10, 1); // Normalize intensity
  const radius = Math.max(20, Math.min(80, items.length * 3)); // Dynamic radius

  const getClusterColor = () => {
    switch (type) {
      case 'disaster': return '#EF4444';
      case 'news': return '#10B981';
      case 'tourism': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getClusterIcon = () => {
    switch (type) {
      case 'disaster': return '⚠️';
      case 'news': return '📰';
      case 'tourism': return '📍';
      default: return '●';
    }
  };

  return (
    <CircleMarker
      center={[centerLat, centerLng]}
      radius={radius}
      pathOptions={{
        fillColor: getClusterColor(),
        fillOpacity: 0.3 + (intensity * 0.4),
        color: getClusterColor(),
        weight: 2,
        opacity: 0.8,
      }}
    >
      <Popup>
        <div className="text-center p-2">
          <div className="text-2xl mb-2">{getClusterIcon()}</div>
          <div className="font-bold text-lg">{items.length}</div>
          <div className="text-sm capitalize">{type} {items.length === 1 ? 'item' : 'items'}</div>
          <div className="text-xs text-gray-600 mt-1">Zoom in to see individual markers</div>
        </div>
      </Popup>
    </CircleMarker>
  );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  disasters,
  news,
  tourism,
  viewMode,
  selectedState,
  zoomLevel,
  onMapClick,
  onStateSelect
}) => {
  const [currentZoom, setCurrentZoom] = useState(4);
  
  // Zoom thresholds for different visualization modes
  const HEATMAP_ZOOM_THRESHOLD = 6; // Below this zoom level, show heatmaps
  const MARKER_ZOOM_THRESHOLD = 8; // Above this zoom level, show all individual markers
  
  // Map center and zoom based on selection
  const getMapCenter = () => {
    if (selectedState && US_STATES[selectedState]) {
      return [US_STATES[selectedState].coordinates.lat, US_STATES[selectedState].coordinates.lng] as [number, number];
    }
    return [39.8283, -98.5795] as [number, number]; // Center of USA
  };

  const getMapZoom = () => {
    if (selectedState) return 7;
    return 4;
  };

  // Create disaster marker with smaller rating text
  const createDisasterIcon = (disaster: Disaster) => {
    const color = getDisasterColor(disaster.type);
    const severityColor = getSeverityColor(disaster.severity);
    const icon = getDisasterIcon(disaster.type);

    return divIcon({
      html: `
        <div class="relative">
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold ${
            disaster.status === 'active' ? 'animate-pulse' : ''
          }" 
               style="background-color: ${color}; border-color: ${severityColor};">
            <span style="font-size: 12px;">${icon}</span>
          </div>
          ${disaster.status === 'active' ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          ` : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Create news marker with smaller rating text
  const createNewsIcon = (article: NewsArticle) => {
    const categoryColor = getCategoryColor(article.category);
    const icon = getNewsIcon(article.category);

    return divIcon({
      html: `
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold" 
               style="background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd);">
            <span style="font-size: 14px;">${icon}</span>
          </div>
          ${article.trending ? `
            <div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black">
              <span style="font-size: 8px;">🔥</span>
            </div>
          ` : ''}
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center font-bold border border-gray-300" 
               style="color: ${categoryColor}; font-size: 9px;">
            ${Math.round(article.localRelevance)}
          </div>
        </div>
      `,
      className: 'custom-news-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Create tourism marker with smaller rating text
  const createTourismIcon = (spot: TourismSpot) => {
    const icon = getTourismIcon(spot.category);
    const ratingColor = spot.rating >= 4 ? '#10B981' : spot.rating >= 3 ? '#F59E0B' : '#EF4444';

    return divIcon({
      html: `
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold bg-purple-600">
            <span style="font-size: 14px;">${icon}</span>
          </div>
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center font-bold border-2" 
               style="color: ${ratingColor}; border-color: ${ratingColor}; font-size: 8px;">
            ${spot.rating.toFixed(1)}
          </div>
        </div>
      `,
      className: 'custom-tourism-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Group items by state for heatmap visualization
  const groupItemsByState = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    
    items.forEach(item => {
      const state = item.location.state;
      if (!grouped[state]) {
        grouped[state] = [];
      }
      grouped[state].push(item);
    });
    
    return grouped;
  };

  // Determine what to show based on zoom level
  const shouldShowHeatmap = currentZoom < HEATMAP_ZOOM_THRESHOLD;
  const shouldShowSomeMarkers = currentZoom >= HEATMAP_ZOOM_THRESHOLD && currentZoom < MARKER_ZOOM_THRESHOLD;
  const shouldShowAllMarkers = currentZoom >= MARKER_ZOOM_THRESHOLD;

  // Filter items for partial display at medium zoom levels
  const getFilteredItems = (items: any[], maxItems: number = 50) => {
    if (shouldShowAllMarkers) return items;
    if (shouldShowSomeMarkers) {
      // Show high-priority items first
      return items
        .sort((a, b) => {
          if (a.severity === 'critical' || a.trending || a.rating >= 4.5) return -1;
          if (b.severity === 'critical' || b.trending || b.rating >= 4.5) return 1;
          return 0;
        })
        .slice(0, maxItems);
    }
    return [];
  };

  const handleMarkerClick = useCallback((lat: number, lng: number) => {
    if (onMapClick) {
      onMapClick(lat, lng);
    }
  }, [onMapClick]);

  const shouldShowDisasters = viewMode === 'disasters' || viewMode === 'overview';
  const shouldShowNews = viewMode === 'news' || viewMode === 'overview';
  const shouldShowTourism = viewMode === 'tourism' || viewMode === 'overview';

  // Get filtered data based on zoom level
  const filteredDisasters = getFilteredItems(disasters, 30);
  const filteredNews = getFilteredItems(news, 40);
  const filteredTourism = getFilteredItems(tourism, 35);

  return (
    <div className="h-full w-full relative">
      {/* Zoom level indicator */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
        <div className="flex items-center space-x-2">
          <span>Zoom: {currentZoom}</span>
          <span className="text-slate-400">|</span>
          <span className="text-blue-400">
            {shouldShowHeatmap ? 'Heatmap' : shouldShowSomeMarkers ? 'Filtered' : 'All Markers'}
          </span>
        </div>
      </div>

      <MapContainer 
        center={getMapCenter()} 
        zoom={getMapZoom()} 
        className="h-full w-full rounded-lg" 
        style={{ background: "#1e293b" }}
        key={`${selectedState}-${zoomLevel}`}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Zoom tracker */}
        <ZoomTracker onZoomChange={setCurrentZoom} />

        {/* Map click handler */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Heatmap visualization for low zoom levels */}
        {shouldShowHeatmap && (
          <>
            {shouldShowDisasters && Object.entries(groupItemsByState(disasters)).map(([stateCode, stateDisasters]) => {
              const state = US_STATES[stateCode];
              if (!state) return null;
              
              return (
                <HeatmapCluster
                  key={`disaster-heatmap-${stateCode}`}
                  items={stateDisasters}
                  type="disaster"
                  bounds={state.bounds}
                />
              );
            })}
            
            {shouldShowNews && Object.entries(groupItemsByState(news)).map(([stateCode, stateNews]) => {
              const state = US_STATES[stateCode];
              if (!state) return null;
              
              return (
                <HeatmapCluster
                  key={`news-heatmap-${stateCode}`}
                  items={stateNews}
                  type="news"
                  bounds={state.bounds}
                />
              );
            })}
            
            {shouldShowTourism && Object.entries(groupItemsByState(tourism)).map(([stateCode, stateTourism]) => {
              const state = US_STATES[stateCode];
              if (!state) return null;
              
              return (
                <HeatmapCluster
                  key={`tourism-heatmap-${stateCode}`}
                  items={stateTourism}
                  type="tourism"
                  bounds={state.bounds}
                />
              );
            })}
          </>
        )}

        {/* Individual markers for higher zoom levels */}
        {!shouldShowHeatmap && (
          <>
            {/* Disaster Markers */}
            {shouldShowDisasters && filteredDisasters.map((disaster) => (
              <Marker 
                key={`disaster-${disaster.id}`} 
                position={[disaster.location.lat, disaster.location.lng]} 
                icon={createDisasterIcon(disaster)}
                eventHandlers={{
                  click: () => handleMarkerClick(disaster.location.lat, disaster.location.lng)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 max-w-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{disaster.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                          disaster.status === 'active' ? 'bg-red-500' : 
                          disaster.status === 'contained' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      >
                        {disaster.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{disaster.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm font-medium capitalize">{disaster.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Severity:</span>
                        <span 
                          className="text-sm font-medium px-2 py-0.5 rounded text-white" 
                          style={{ backgroundColor: getSeverityColor(disaster.severity) }}
                        >
                          {disaster.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">
                          {disaster.location.city ? `${disaster.location.city}, ` : ''}{disaster.location.state}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(disaster.date).toLocaleDateString()}
                        </span>
                      </div>
                      {disaster.affectedPeople && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Affected:</span>
                          <span className="text-sm font-medium">{disaster.affectedPeople.toLocaleString()} people</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* News Markers */}
            {shouldShowNews && filteredNews.map((article) => (
              <Marker 
                key={`news-${article.id}`} 
                position={[article.location.lat, article.location.lng]} 
                icon={createNewsIcon(article)}
                eventHandlers={{
                  click: () => handleMarkerClick(article.location.lat, article.location.lng)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 max-w-sm">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 leading-tight">{article.title}</h3>
                      <div className="flex flex-col items-end ml-2">
                        {article.trending && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-yellow-500 mb-1">
                            TRENDING
                          </span>
                        )}
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getCategoryColor(article.category) }}
                        >
                          {article.category.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {article.imageUrl && (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}

                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">{article.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Source:</span>
                        <span className="text-sm font-medium">{article.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">
                          {article.location.city ? `${article.location.city}, ` : ''}{article.location.state}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Published:</span>
                        <span className="text-sm font-medium">{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Relevance:</span>
                        <span className="text-sm font-medium">{article.localRelevance}/10</span>
                      </div>
                    </div>

                    {article.url && article.url !== '#' && (
                      <button
                        onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Read Full Article</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Tourism Markers */}
            {shouldShowTourism && filteredTourism.map((spot) => (
              <Marker 
                key={`tourism-${spot.id}`} 
                position={[spot.location.lat, spot.location.lng]} 
                icon={createTourismIcon(spot)}
                eventHandlers={{
                  click: () => handleMarkerClick(spot.location.lat, spot.location.lng)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 max-w-sm">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
                      <div className="flex items-center">
                        {getRatingStars(spot.rating)}
                        <span className="ml-1 text-sm font-medium">{spot.rating}</span>
                      </div>
                    </div>

                    {spot.imageUrl && (
                      <img 
                        src={spot.imageUrl} 
                        alt={spot.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}

                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">{spot.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm font-medium capitalize">{spot.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">
                          {spot.location.city ? `${spot.location.city}, ` : ''}{spot.location.state}
                        </span>
                      </div>
                      {spot.entryFee !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Entry Fee:</span>
                          <span className="text-sm font-medium">{formatPrice(spot.entryFee)}</span>
                        </div>
                      )}
                      {spot.visitorsPerYear && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Annual Visitors:</span>
                          <span className="text-sm font-medium">{spot.visitorsPerYear.toLocaleString()}</span>
                        </div>
                      )}
                      {spot.openingHours && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Hours:</span>
                          <span className="text-sm font-medium">{spot.openingHours}</span>
                        </div>
                      )}
                    </div>

                    {spot.amenities.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">Amenities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {spot.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {spot.website && (
                      <button
                        onClick={() => window.open(spot.website, '_blank', 'noopener,noreferrer')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit Website</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;