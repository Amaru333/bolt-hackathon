import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Info, TrendingUp } from 'lucide-react';
import InteractiveMap from './components/Map/InteractiveMap';
import Sidebar from './components/Sidebar/Sidebar';
import StatePanel from './components/StatePanel/StatePanel';
import { ViewMode, FilterState, ZoomLevel } from './types/data';
import { useUSData } from './hooks/useUSData';
import { useStateData } from './hooks/useStateData';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('country');

  const [filters, setFilters] = useState<FilterState>({
    disasters: {
      types: [
        'earthquake',
        'wildfire',
        'hurricane',
        'tornado',
        'flood',
        'drought',
        'winter_storm',
        'heat_wave',
      ],
      severities: ['low', 'medium', 'high', 'critical'],
      status: ['active', 'contained', 'resolved'],
      dateRange: { start: '', end: '' },
    },
    news: {
      categories: [
        'breaking',
        'politics',
        'business',
        'technology',
        'health',
        'sports',
        'entertainment',
        'weather',
      ],
      trending: false,
      localOnly: false,
      dateRange: { start: '', end: '' },
    },
    tourism: {
      categories: [
        'national_park',
        'monument',
        'museum',
        'beach',
        'mountain',
        'city_attraction',
        'historical_site',
        'entertainment',
        'shopping',
        'restaurant',
      ],
      rating: 1,
      priceRange: { min: 0, max: 1000 },
    },
  });

  const {
    disasters,
    news,
    tourism,
    isLoading,
    lastUpdated,
    refreshData,
    useRealData,
    toggleDataSource,
  } = useUSData();
  const { stateInfo, getStateFromCoordinates } = useStateData();

  // Filter data based on current filters and selected state
  const filteredData = useMemo(() => {
    let filteredDisasters = disasters.filter((disaster) => {
      // Apply disaster filters
      if (!filters.disasters.types.includes(disaster.type)) return false;
      if (!filters.disasters.severities.includes(disaster.severity)) return false;
      if (!filters.disasters.status.includes(disaster.status)) return false;

      // State filter
      if (selectedState && disaster.location.state !== selectedState) return false;

      // Date filter
      if (filters.disasters.dateRange.start || filters.disasters.dateRange.end) {
        const eventDate = new Date(disaster.date);
        if (
          filters.disasters.dateRange.start &&
          eventDate < new Date(filters.disasters.dateRange.start)
        )
          return false;
        if (
          filters.disasters.dateRange.end &&
          eventDate > new Date(filters.disasters.dateRange.end)
        )
          return false;
      }

      return true;
    });

    let filteredNews = news.filter((article) => {
      // Apply news filters - Fixed the filter logic
      if (filters.news.categories.length > 0 && !filters.news.categories.includes(article.category))
        return false;

      // Fixed trending filter - only filter if trending is true
      if (filters.news.trending && !article.trending) return false;

      // State filter
      if (selectedState && article.location.state !== selectedState) return false;

      // Fixed local only filter - only apply if both localOnly is true AND a state is selected
      if (filters.news.localOnly && selectedState && article.location.state !== selectedState)
        return false;

      // Date filter
      if (filters.news.dateRange.start || filters.news.dateRange.end) {
        const articleDate = new Date(article.publishedAt);
        if (filters.news.dateRange.start && articleDate < new Date(filters.news.dateRange.start))
          return false;
        if (filters.news.dateRange.end && articleDate > new Date(filters.news.dateRange.end))
          return false;
      }

      return true;
    });

    let filteredTourism = tourism.filter((spot) => {
      // Apply tourism filters
      if (!filters.tourism.categories.includes(spot.category)) return false;
      if (spot.rating < filters.tourism.rating) return false;

      // State filter
      if (selectedState && spot.location.state !== selectedState) return false;

      // Price filter
      if (spot.entryFee !== undefined) {
        if (
          spot.entryFee < filters.tourism.priceRange.min ||
          spot.entryFee > filters.tourism.priceRange.max
        )
          return false;
      }

      return true;
    });

    return { disasters: filteredDisasters, news: filteredNews, tourism: filteredTourism };
  }, [disasters, news, tourism, filters, selectedState]);

  const handleMapClick = (lat: number, lng: number) => {
    const state = getStateFromCoordinates(lat, lng);
    if (state) {
      setSelectedState(state);
      setZoomLevel('state');
    }
  };

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    setZoomLevel('state');
  };

  const handleBackToCountry = () => {
    setSelectedState(null);
    setZoomLevel('country');
  };

  const getDisplayCounts = () => {
    return {
      disasters: filteredData.disasters.length,
      news: filteredData.news.length,
      tourism: filteredData.tourism.length,
      total: filteredData.disasters.length + filteredData.news.length + filteredData.tourism.length,
    };
  };

  const counts = getDisplayCounts();

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 flex-shrink-0 border-r border-slate-700 flex flex-col">
        <Sidebar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          selectedState={selectedState}
          zoomLevel={zoomLevel}
          counts={counts}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
          onStateSelect={handleStateSelect}
          onBackToCountry={handleBackToCountry}
          useRealData={useRealData}
          onToggleDataSource={toggleDataSource}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-blue-400" />
                On a Map
                {selectedState && (
                  <span className="ml-2 text-lg text-blue-400">
                    • {stateInfo[selectedState]?.name || selectedState}
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {viewMode === 'overview' &&
                  `Showing ${counts.total.toLocaleString()} items across all categories`}
                {viewMode === 'disasters' &&
                  `Showing ${counts.disasters.toLocaleString()} disasters`}
                {viewMode === 'news' && `Showing ${counts.news.toLocaleString()} news articles`}
                {viewMode === 'tourism' &&
                  `Showing ${counts.tourism.toLocaleString()} tourism spots`}
                {selectedState && ` in ${stateInfo[selectedState]?.name || selectedState}`}
                {isLoading && (
                  <span className="ml-2 inline-flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                    Updating...
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    useRealData ? 'bg-green-500' : 'bg-blue-500'
                  } animate-pulse`}
                />
                <span className="text-sm text-slate-400">
                  {useRealData ? 'Live Data' : 'Mock Data'}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Map Container */}
          <div className={`${selectedState ? 'flex-1' : 'flex-1'} p-6 min-h-0 overflow-hidden`}>
            <div className="h-full rounded-lg overflow-hidden shadow-2xl border border-slate-700">
              <InteractiveMap
                disasters={filteredData.disasters}
                news={filteredData.news}
                tourism={filteredData.tourism}
                viewMode={viewMode}
                selectedState={selectedState}
                zoomLevel={zoomLevel}
                onMapClick={handleMapClick}
                onStateSelect={handleStateSelect}
              />
            </div>
          </div>

          {/* State Panel */}
          {selectedState && (
            <div className="w-96 flex-shrink-0">
              <StatePanel
                stateCode={selectedState}
                onClose={handleBackToCountry}
                disasters={filteredData.disasters.filter((d) => d.location.state === selectedState)}
                news={filteredData.news.filter((n) => n.location.state === selectedState)}
                tourism={filteredData.tourism.filter((t) => t.location.state === selectedState)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
