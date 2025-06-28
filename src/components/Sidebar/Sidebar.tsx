import React from "react";
import { Filter, BarChart3, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { CatastropheType, FilterState } from "../../types/catastrophe";
import { DataFetchStatus } from "../../types/api";
import { getCatastropheColor, getCatastropheIcon } from "../../utils/mapUtils";
import DataStatus from "../DataStatus/DataStatus";

interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCatastrophes: number;
  activeCatastrophes: number;
  recentCatastrophes: number;
  status: DataFetchStatus;
  isLoading: boolean;
  onRefresh: () => void;
  onClearErrors: () => void;
  lastUpdated: Record<string, number>;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, onFiltersChange, totalCatastrophes, activeCatastrophes, recentCatastrophes, status, isLoading, onRefresh, onClearErrors, lastUpdated }) => {
  const catastropheTypes: CatastropheType[] = ["earthquake", "fire", "flood", "hurricane", "tornado", "volcano", "accident", "drought", "landslide", "tsunami", "air_quality"];

  const severityLevels = ["low", "medium", "high", "critical"] as const;

  const handleTypeToggle = (type: CatastropheType) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type];

    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleSeverityToggle = (severity: (typeof severityLevels)[number]) => {
    const newSeverities = filters.severities.includes(severity) ? filters.severities.filter((s) => s !== severity) : [...filters.severities, severity];

    onFiltersChange({ ...filters, severities: newSeverities });
  };

  const getSeverityColor = (severity: (typeof severityLevels)[number]): string => {
    const colors = {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#991B1B",
    };
    return colors[severity] || "#6B7280";
  };

  return (
    <div className="bg-slate-800 text-white h-full flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Global Catastrophe Monitor</h1>
          <p className="text-slate-400 text-sm">Real-time global disaster tracking with live API data</p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Live Statistics
          </h2>
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold">{totalCatastrophes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Events</p>
                  <p className="text-2xl font-bold text-red-400">{activeCatastrophes}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Last 24 Hours</p>
                  <p className="text-2xl font-bold text-yellow-400">{recentCatastrophes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>

          {/* Active Events Toggle */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={filters.showActive} onChange={(e) => onFiltersChange({ ...filters, showActive: e.target.checked })} className="sr-only" />
              <div className={`relative w-12 h-6 rounded-full transition-colors ${filters.showActive ? "bg-blue-500" : "bg-slate-600"}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.showActive ? "translate-x-6" : "translate-x-0"}`} />
              </div>
              <span className="ml-3 text-sm">Show only active events</span>
            </label>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-slate-300">Date Range</h3>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Catastrophe Types */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-slate-300">Event Types</h3>
            <div className="space-y-2">
              {catastropheTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer group">
                  <input type="checkbox" checked={filters.types.includes(type)} onChange={() => handleTypeToggle(type)} className="sr-only" />
                  <div className={`w-4 h-4 rounded border-2 mr-3 transition-colors ${filters.types.includes(type) ? "bg-blue-500 border-blue-500" : "border-slate-500 group-hover:border-slate-400"}`}>
                    {filters.types.includes(type) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs" style={{ backgroundColor: getCatastropheColor(type) }}>
                    {getCatastropheIcon(type)}
                  </span>
                  <span className="text-sm capitalize group-hover:text-white transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity Levels */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-slate-300">Severity Levels</h3>
            <div className="space-y-2">
              {severityLevels.map((severity) => (
                <label key={severity} className="flex items-center cursor-pointer group">
                  <input type="checkbox" checked={filters.severities.includes(severity)} onChange={() => handleSeverityToggle(severity)} className="sr-only" />
                  <div
                    className={`w-4 h-4 rounded border-2 mr-3 transition-colors ${
                      filters.severities.includes(severity) ? "bg-blue-500 border-blue-500" : "border-slate-500 group-hover:border-slate-400"
                    }`}
                  >
                    {filters.severities.includes(severity) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: getSeverityColor(severity) }} />
                  <span className="text-sm capitalize group-hover:text-white transition-colors">{severity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Legend</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-ping" />
              <span>Active Event</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-white rounded-full mr-2" />
              <span>Event Severity Border</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span>Real-time Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom section with DataStatus */}
      <div className="flex-shrink-0 p-6 border-t border-slate-700">
        <DataStatus status={status} isLoading={isLoading} onRefresh={onRefresh} onClearErrors={onClearErrors} lastUpdated={lastUpdated} />
      </div>
    </div>
  );
};

export default Sidebar;
