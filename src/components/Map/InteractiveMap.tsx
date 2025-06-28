import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Catastrophe } from '../../types/catastrophe';
import { getCatastropheColor, getCatastropheIcon, getSeverityColor, formatNumber, formatCurrency } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  catastrophes: Catastrophe[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ catastrophes }) => {
  const createCustomIcon = (catastrophe: Catastrophe) => {
    const color = getCatastropheColor(catastrophe.type);
    const severityColor = getSeverityColor(catastrophe.severity);
    
    return divIcon({
      html: `
        <div class="relative">
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold animate-pulse" 
               style="background-color: ${color}; border-color: ${severityColor};">
            ${getCatastropheIcon(catastrophe.type)}
          </div>
          ${catastrophe.status === 'active' ? `
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full rounded-lg"
        style={{ background: '#1e293b' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {catastrophes.map((catastrophe) => (
          <Marker
            key={catastrophe.id}
            position={[catastrophe.location.lat, catastrophe.location.lng]}
            icon={createCustomIcon(catastrophe)}
          >
            <Popup className="custom-popup">
              <div className="p-4 max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">{catastrophe.title}</h3>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      catastrophe.status === 'active' ? 'bg-red-500' :
                      catastrophe.status === 'contained' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                  >
                    {catastrophe.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{catastrophe.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className="text-sm font-medium capitalize">{catastrophe.type}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Severity:</span>
                    <span 
                      className="text-sm font-medium px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: getSeverityColor(catastrophe.severity) }}
                    >
                      {catastrophe.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location:</span>
                    <span className="text-sm font-medium">{catastrophe.location.region}, {catastrophe.location.country}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="text-sm font-medium">{formatDate(catastrophe.date)}</span>
                  </div>
                  
                  {catastrophe.affectedPeople && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Affected:</span>
                      <span className="text-sm font-medium">{formatNumber(catastrophe.affectedPeople)} people</span>
                    </div>
                  )}
                  
                  {catastrophe.economicImpact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Impact:</span>
                      <span className="text-sm font-medium">{formatCurrency(catastrophe.economicImpact)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;