import React, { useMemo } from "react";
import { BarChart3, TrendingUp, AlertTriangle, Globe, Calendar, MapPin } from "lucide-react";
import { Catastrophe } from "../../types/catastrophe";

interface AnalyticsProps {
  catastrophes: Catastrophe[];
}

const Analytics: React.FC<AnalyticsProps> = ({ catastrophes }) => {
  const analytics = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Time-based filtering
    const last24Hours = catastrophes.filter((c) => new Date(c.date).getTime() > oneDayAgo);
    const lastWeek = catastrophes.filter((c) => new Date(c.date).getTime() > oneWeekAgo);
    const lastMonth = catastrophes.filter((c) => new Date(c.date).getTime() > oneMonthAgo);

    // Type distribution
    const typeDistribution = catastrophes.reduce((acc, catastrophe) => {
      acc[catastrophe.type] = (acc[catastrophe.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Severity distribution
    const severityDistribution = catastrophes.reduce((acc, catastrophe) => {
      acc[catastrophe.severity] = (acc[catastrophe.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Country distribution
    const countryDistribution = catastrophes.reduce((acc, catastrophe) => {
      acc[catastrophe.location.country] = (acc[catastrophe.location.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top countries
    const topCountries = Object.entries(countryDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Economic impact
    const totalEconomicImpact = catastrophes.reduce((sum, c) => sum + (c.economicImpact || 0), 0);
    const totalAffectedPeople = catastrophes.reduce((sum, c) => sum + (c.affectedPeople || 0), 0);

    // Most active regions
    const regionActivity = catastrophes.reduce((acc, catastrophe) => {
      const region = catastrophe.location.region;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRegions = Object.entries(regionActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      last24Hours: last24Hours.length,
      lastWeek: lastWeek.length,
      lastMonth: lastMonth.length,
      typeDistribution,
      severityDistribution,
      topCountries,
      totalEconomicImpact,
      totalAffectedPeople,
      topRegions,
      activeEvents: catastrophes.filter((c) => c.status === "active").length,
    };
  }, [catastrophes]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Analytics & Insights
        </h2>
      </div>

      {/* Time-based Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Last 24 Hours</p>
              <p className="text-2xl font-bold text-blue-400">{analytics.last24Hours}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Last Week</p>
              <p className="text-2xl font-bold text-yellow-400">{analytics.lastWeek}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Last Month</p>
              <p className="text-2xl font-bold text-green-400">{analytics.lastMonth}</p>
            </div>
            <Globe className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Economic Impact</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(analytics.totalEconomicImpact)}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Affected People</p>
              <p className="text-xl font-bold text-orange-400">{formatNumber(analytics.totalAffectedPeople)}</p>
            </div>
            <MapPin className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3 text-slate-300">Most Affected Countries</h3>
        <div className="space-y-2">
          {analytics.topCountries.map(([country, count], index) => (
            <div key={country} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-400 w-6">{index + 1}.</span>
                <span className="text-sm text-white">{country}</span>
              </div>
              <span className="text-sm text-slate-400">{count} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Regions */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3 text-slate-300">Most Active Regions</h3>
        <div className="space-y-2">
          {analytics.topRegions.map(([region, count], index) => (
            <div key={region} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-400 w-6">{index + 1}.</span>
                <span className="text-sm text-white">{region}</span>
              </div>
              <span className="text-sm text-slate-400">{count} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3 text-slate-300">Event Type Distribution</h3>
        <div className="space-y-2">
          {Object.entries(analytics.typeDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm capitalize text-white">{type.replace("_", " ")}</span>
                </div>
                <span className="text-sm text-slate-400">{count} events</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
