import React, { useState, useMemo } from "react";
import InteractiveMap from "./components/Map/InteractiveMap";
import Sidebar from "./components/Sidebar/Sidebar";
import { FilterState } from "./types/catastrophe";
import { useRealTimeData } from "./hooks/useRealTimeData";

function App() {
  const [filters, setFilters] = useState<FilterState>({
    types: ["earthquake", "fire", "flood", "hurricane", "tornado", "volcano", "accident", "drought", "landslide"],
    severities: ["low", "medium", "high", "critical"],
    dateRange: {
      start: "",
      end: "",
    },
    showActive: false,
  });

  const { catastrophes, status, isLoading, fetchData, clearErrors, lastUpdated } = useRealTimeData(300000); // 5 minutes

  const filteredCatastrophes = useMemo(() => {
    return catastrophes.filter((catastrophe) => {
      // Filter by type
      if (!filters.types.includes(catastrophe.type)) {
        return false;
      }

      // Filter by severity
      if (!filters.severities.includes(catastrophe.severity)) {
        return false;
      }

      // Filter by active status
      if (filters.showActive && catastrophe.status !== "active") {
        return false;
      }

      // Filter by date range
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(catastrophe.date);
        if (filters.dateRange.start && eventDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && eventDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });
  }, [catastrophes, filters]);

  const activeCatastrophes = useMemo(() => {
    return catastrophes.filter((c) => c.status === "active").length;
  }, [catastrophes]);

  const recentCatastrophes = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return catastrophes.filter((c) => new Date(c.date).getTime() > oneDayAgo).length;
  }, [catastrophes]);

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-slate-700 flex flex-col">
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          totalCatastrophes={catastrophes.length}
          activeCatastrophes={activeCatastrophes}
          recentCatastrophes={recentCatastrophes}
          status={status}
          isLoading={isLoading}
          onRefresh={fetchData}
          onClearErrors={clearErrors}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Real-Time Global Map View</h2>
              <p className="text-slate-400 text-sm">
                Showing {filteredCatastrophes.length} of {catastrophes.length} events
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
                  className={`w-2 h-2 rounded-full ${status.earthquakes === "success" && status.weather === "success" && status.fires === "success" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                />
                <span className="text-sm text-slate-400">
                  {status.earthquakes === "success" && status.weather === "success" && status.fires === "success" ? "Live Data Connected" : "Connection Issues"}
                </span>
              </div>
              <div className="text-sm text-slate-400">Last updated: {lastUpdated.earthquakes ? new Date(Math.max(...Object.values(lastUpdated))).toLocaleTimeString() : "Never"}</div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 p-6 min-h-0 overflow-hidden">
          <div className="h-full rounded-lg overflow-hidden shadow-2xl border border-slate-700">
            <InteractiveMap catastrophes={filteredCatastrophes} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
