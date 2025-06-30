import React, { useState } from "react";
import { Layers, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { DataLayer } from "../../types/country";

interface DataLayersProps {
  layers: DataLayer[];
  onLayerToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
}

const DataLayers: React.FC<DataLayersProps> = ({ layers, onLayerToggle, onLayerOpacityChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'demographic': return '👥';
      case 'economic': return '💰';
      case 'environmental': return '🌍';
      case 'infrastructure': return '🏗️';
      case 'social': return '📱';
      default: return '📊';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'demographic': return 'text-blue-400';
      case 'economic': return 'text-green-400';
      case 'environmental': return 'text-emerald-400';
      case 'infrastructure': return 'text-orange-400';
      case 'social': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'heatmap': return 'Heat intensity visualization';
      case 'choropleth': return 'Country/region coloring';
      case 'points': return 'Point markers';
      case 'lines': return 'Connection lines';
      default: return 'Data visualization';
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-600">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-4 text-white hover:bg-slate-700/50 transition-colors rounded-lg group"
        >
          <div className="flex items-center">
            <Layers className="w-5 h-5 mr-3 text-blue-400" />
            <div className="text-left">
              <div className="font-semibold">Data Layers</div>
              <div className="text-xs text-slate-400">
                {layers.filter(l => l.visible).length} of {layers.length} active
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-slate-400">
              {layers.filter(l => l.visible).length}/{layers.length}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-slate-600 p-4 max-h-96 overflow-y-auto">
            {layers.length > 0 ? (
              <div className="space-y-4">
                {layers.map((layer) => (
                  <div key={layer.id} className="space-y-3">
                    {/* Layer Toggle */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onLayerToggle(layer.id)}
                        className="flex items-center flex-1 text-left hover:bg-slate-700/50 p-3 rounded-lg transition-colors group"
                      >
                        <span className="mr-3 text-lg">{getCategoryIcon(layer.category)}</span>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
                            {layer.name}
                          </div>
                          <div className={`text-xs ${getCategoryColor(layer.category)}`}>
                            {layer.category} • {getTypeDescription(layer.type)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {layer.data.length} data points
                          </div>
                        </div>
                        <div className="ml-2">
                          {layer.visible ? (
                            <Eye className="w-5 h-5 text-blue-400" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Opacity Slider */}
                    {layer.visible && (
                      <div className="ml-12 mr-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Opacity</span>
                          <span className="text-xs text-white font-medium">
                            {Math.round(layer.opacity * 100)}%
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) => onLayerOpacityChange(layer.id, parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, ${layer.colorScale[0]} 0%, ${layer.colorScale[layer.colorScale.length - 1]} 100%)`
                            }}
                          />
                        </div>
                        
                        {/* Color Scale Preview */}
                        <div className="flex items-center space-x-1 mt-2">
                          <span className="text-xs text-slate-400">Low</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                            {layer.colorScale.map((color, index) => (
                              <div
                                key={index}
                                className="flex-1 h-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">High</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No data layers available</p>
                <p className="text-xs mt-1">Data layers will appear here when loaded</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataLayers;