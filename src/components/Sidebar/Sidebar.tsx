import React, { useState } from 'react';
import {
  Map,
  AlertTriangle,
  Newspaper,
  Camera,
  BarChart3,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MapPin,
  ArrowLeft,
  Eye,
  Calendar,
  Star,
  DollarSign,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ViewMode, FilterState, ZoomLevel } from '../../types/data';
import { US_STATES } from '../../data/states';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  selectedState: string | null;
  zoomLevel: ZoomLevel;
  counts: {
    disasters: number;
    news: number;
    tourism: number;
    total: number;
  };
  isLoading: boolean;
  lastUpdated: number | null;
  onRefresh: () => void;
  onStateSelect: (stateCode: string) => void;
  onBackToCountry: () => void;
  useRealData?: boolean;
  onToggleDataSource?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  selectedState,
  zoomLevel,
  counts,
  isLoading,
  lastUpdated,
  onRefresh,
  onStateSelect,
  onBackToCountry,
  useRealData = false,
  onToggleDataSource,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    disasters: true,
    news: true,
    tourism: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: Map, color: 'bg-blue-600', count: counts.total },
    {
      id: 'disasters',
      label: 'Disasters',
      icon: AlertTriangle,
      color: 'bg-red-600',
      count: counts.disasters,
    },
    { id: 'news', label: 'News', icon: Newspaper, color: 'bg-green-600', count: counts.news },
    {
      id: 'tourism',
      label: 'Tourism',
      icon: Camera,
      color: 'bg-purple-600',
      count: counts.tourism,
    },
  ];

  const disasterTypes = [
    { id: 'earthquake', label: 'Earthquakes', icon: '🏔️' },
    { id: 'wildfire', label: 'Wildfires', icon: '🔥' },
    { id: 'hurricane', label: 'Hurricanes', icon: '🌀' },
    { id: 'tornado', label: 'Tornadoes', icon: '🌪️' },
    { id: 'flood', label: 'Floods', icon: '🌊' },
    { id: 'drought', label: 'Droughts', icon: '🏜️' },
    { id: 'winter_storm', label: 'Winter Storms', icon: '❄️' },
    { id: 'heat_wave', label: 'Heat Waves', icon: '🌡️' },
  ];

  const newsCategories = [
    { id: 'breaking', label: 'Breaking News', icon: '🚨' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
  ];

  const tourismCategories = [
    { id: 'national_park', label: 'National Parks', icon: '🏞️' },
    { id: 'monument', label: 'Monuments', icon: '🗽' },
    { id: 'museum', label: 'Museums', icon: '🏛️' },
    { id: 'beach', label: 'Beaches', icon: '🏖️' },
    { id: 'mountain', label: 'Mountains', icon: '⛰️' },
    { id: 'city_attraction', label: 'City Attractions', icon: '🏙️' },
    { id: 'historical_site', label: 'Historical Sites', icon: '🏰' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎢' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  ];

  return (
    <div className="bg-slate-800 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            On a Map
          </h1>
          <div className="flex items-center space-x-2">
            {onToggleDataSource && (
              <button
                onClick={onToggleDataSource}
                className={`p-2 rounded-lg transition-colors ${
                  useRealData
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
                title={useRealData ? 'Using Real APIs' : 'Using Mock Data'}
              >
                {useRealData ? <Wifi className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Source Indicator */}
        <div className="mb-4 p-2 bg-slate-700 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              {useRealData ? (
                <Wifi className="w-3 h-3 mr-1 text-green-400" />
              ) : (
                <Database className="w-3 h-3 mr-1 text-blue-400" />
              )}
              <span className="text-slate-300">{useRealData ? 'Live APIs' : 'Mock Data'}</span>
            </div>
            <span className="text-slate-400">{counts.total.toLocaleString()} items</span>
          </div>
          {useRealData && (
            <div className="text-xs text-slate-400 mt-1">
              USGS • News API • Weather Service • NPS
            </div>
          )}
        </div>

        {/* Navigation */}
        {selectedState && (
          <button
            onClick={onBackToCountry}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to USA
          </button>
        )}

        {/* View Mode Selection */}
        <div className="space-y-2">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onViewModeChange(mode.id as ViewMode)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  viewMode === mode.id
                    ? `${mode.color} text-white`
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{mode.label}</span>
                </div>
                <span className="bg-black/20 px-2 py-1 rounded-full text-xs font-bold">
                  {mode.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* State Selection */}
        {!selectedState && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Quick State Access
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {Object.entries(US_STATES)
                .slice(0, 20)
                .map(([code, state]) => (
                  <button
                    key={code}
                    onClick={() => onStateSelect(code)}
                    className="text-left p-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                  >
                    {state.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>

          {/* Disaster Filters */}
          {(viewMode === 'disasters' || viewMode === 'overview') && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('disasters')}
                className="flex items-center justify-between w-full p-2 bg-slate-700 rounded-lg mb-2"
              >
                <span className="font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                  Disasters
                </span>
                {expandedSections.disasters ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedSections.disasters && (
                <div className="space-y-3 pl-4">
                  {/* Disaster Types */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Types</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {disasterTypes.map((type) => (
                        <label key={type.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.disasters.types.includes(type.id as any)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...filters.disasters.types, type.id as any]
                                : filters.disasters.types.filter((t) => t !== type.id);
                              onFiltersChange({
                                ...filters,
                                disasters: { ...filters.disasters, types: newTypes },
                              });
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border-2 mr-2 transition-colors ${
                              filters.disasters.types.includes(type.id as any)
                                ? 'bg-red-500 border-red-500'
                                : 'border-slate-500 group-hover:border-slate-400'
                            }`}
                          >
                            {filters.disasters.types.includes(type.id as any) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm mr-2">{type.icon}</span>
                          <span className="text-sm group-hover:text-white transition-colors">
                            {type.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Date Range</h4>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={filters.disasters.dateRange.start}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            disasters: {
                              ...filters.disasters,
                              dateRange: { ...filters.disasters.dateRange, start: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                      <input
                        type="date"
                        value={filters.disasters.dateRange.end}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            disasters: {
                              ...filters.disasters,
                              dateRange: { ...filters.disasters.dateRange, end: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* News Filters */}
          {(viewMode === 'news' || viewMode === 'overview') && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('news')}
                className="flex items-center justify-between w-full p-2 bg-slate-700 rounded-lg mb-2"
              >
                <span className="font-medium flex items-center">
                  <Newspaper className="w-4 h-4 mr-2 text-green-400" />
                  News
                </span>
                {expandedSections.news ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedSections.news && (
                <div className="space-y-3 pl-4">
                  {/* News Categories */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Categories</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {newsCategories.map((category) => (
                        <label key={category.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.news.categories.includes(category.id as any)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...filters.news.categories, category.id as any]
                                : filters.news.categories.filter((c) => c !== category.id);
                              onFiltersChange({
                                ...filters,
                                news: { ...filters.news, categories: newCategories },
                              });
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border-2 mr-2 transition-colors ${
                              filters.news.categories.includes(category.id as any)
                                ? 'bg-green-500 border-green-500'
                                : 'border-slate-500 group-hover:border-slate-400'
                            }`}
                          >
                            {filters.news.categories.includes(category.id as any) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm mr-2">{category.icon}</span>
                          <span className="text-sm group-hover:text-white transition-colors">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* News Options */}
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.news.trending}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            news: { ...filters.news, trending: e.target.checked },
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          filters.news.trending ? 'bg-green-500' : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            filters.news.trending ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className="ml-3 text-sm">Trending only</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.news.localOnly}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            news: { ...filters.news, localOnly: e.target.checked },
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          filters.news.localOnly ? 'bg-green-500' : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            filters.news.localOnly ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className="ml-3 text-sm">Local news only</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tourism Filters */}
          {(viewMode === 'tourism' || viewMode === 'overview') && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('tourism')}
                className="flex items-center justify-between w-full p-2 bg-slate-700 rounded-lg mb-2"
              >
                <span className="font-medium flex items-center">
                  <Camera className="w-4 h-4 mr-2 text-purple-400" />
                  Tourism
                </span>
                {expandedSections.tourism ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedSections.tourism && (
                <div className="space-y-3 pl-4">
                  {/* Tourism Categories */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Categories</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {tourismCategories.map((category) => (
                        <label key={category.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.tourism.categories.includes(category.id as any)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...filters.tourism.categories, category.id as any]
                                : filters.tourism.categories.filter((c) => c !== category.id);
                              onFiltersChange({
                                ...filters,
                                tourism: { ...filters.tourism, categories: newCategories },
                              });
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border-2 mr-2 transition-colors ${
                              filters.tourism.categories.includes(category.id as any)
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-slate-500 group-hover:border-slate-400'
                            }`}
                          >
                            {filters.tourism.categories.includes(category.id as any) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm mr-2">{category.icon}</span>
                          <span className="text-sm group-hover:text-white transition-colors">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Minimum Rating</h4>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={filters.tourism.rating}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            tourism: { ...filters.tourism, rating: parseInt(e.target.value) },
                          })
                        }
                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-medium">{filters.tourism.rating}</span>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Entry Fee Range</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.tourism.priceRange.min}
                          onChange={(e) =>
                            onFiltersChange({
                              ...filters,
                              tourism: {
                                ...filters.tourism,
                                priceRange: {
                                  ...filters.tourism.priceRange,
                                  min: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.tourism.priceRange.max}
                          onChange={(e) =>
                            onFiltersChange({
                              ...filters,
                              tourism: {
                                ...filters.tourism,
                                priceRange: {
                                  ...filters.tourism.priceRange,
                                  max: parseInt(e.target.value) || 1000,
                                },
                              },
                            })
                          }
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Statistics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Items:</span>
              <span className="font-medium">{counts.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Disasters:</span>
              <span className="font-medium text-red-400">{counts.disasters.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">News Articles:</span>
              <span className="font-medium text-green-400">{counts.news.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tourism Spots:</span>
              <span className="font-medium text-purple-400">{counts.tourism.toLocaleString()}</span>
            </div>
            {selectedState && (
              <div className="flex justify-between pt-2 border-t border-slate-600">
                <span className="text-slate-400">Current State:</span>
                <span className="font-medium text-blue-400">{selectedState}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-600">
              <span className="text-slate-400">Data Source:</span>
              <span className={`font-medium ${useRealData ? 'text-green-400' : 'text-blue-400'}`}>
                {useRealData ? 'Live APIs' : 'Mock Data'}
              </span>
            </div>
            {lastUpdated && (
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated:</span>
                <span className="font-medium text-slate-300">
                  {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
