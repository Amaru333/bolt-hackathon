import React, { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, BarChart3, Target, Zap } from "lucide-react";
import { PredictiveAnalytics as PredictiveAnalyticsType } from "../../types/country";
import { countryService } from "../../services/countryService";

const PredictiveAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<PredictiveAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'risks' | 'trends' | 'correlations'>('risks');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await countryService.getPredictiveAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching predictive analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-white">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-slate-400">Analytics data not available</div>
        </div>
      </div>
    );
  }

  const getRiskColor = (probability: number) => {
    if (probability >= 80) return 'text-red-400 bg-red-900/20';
    if (probability >= 60) return 'text-orange-400 bg-orange-900/20';
    if (probability >= 40) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-green-400 bg-green-900/20';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Brain className="w-6 h-6 mr-2 text-purple-400" />
          Predictive Analytics
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-700 rounded-lg p-1">
        {[
          { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle },
          { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
          { id: 'correlations', label: 'Correlations', icon: Target }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-slate-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'risks' && (
          <div className="space-y-4">
            {analytics.riskAssessment.map((risk) => (
              <div key={risk.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                    <h3 className="text-white font-medium capitalize">{risk.type} Risk</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.probability)}`}>
                    {risk.probability}% probability
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white">{risk.location.region}, {risk.location.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white">{risk.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Severity:</span>
                    <span className={`capitalize ${
                      risk.severity === 'critical' ? 'text-red-400' :
                      risk.severity === 'high' ? 'text-orange-400' :
                      risk.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {risk.severity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-white">{risk.confidence}%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-slate-400 text-sm">Key Factors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {risk.factors.map((factor, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-600 rounded text-xs text-white">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-4">
            {analytics.trendAnalysis.map((trend) => (
              <div key={trend.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getTrendIcon(trend.trend)}
                    <h3 className="text-white font-medium ml-2">{trend.category}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{trend.magnitude}%</div>
                    <div className="text-xs text-slate-400 capitalize">{trend.trend}</div>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-3">{trend.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white">{trend.timeframe}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Affected Regions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trend.regions.map((region, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-600 rounded text-xs text-white">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'correlations' && (
          <div className="space-y-4">
            {analytics.correlationInsights.map((correlation) => (
              <div key={correlation.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-400" />
                    <h3 className="text-white font-medium">Event Correlation</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{(correlation.correlation * 100).toFixed(0)}%</div>
                    <div className="text-xs text-slate-400">{getCorrelationStrength(correlation.correlation)}</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className="px-3 py-1 bg-blue-600 rounded text-white">{correlation.event1}</span>
                    <span className="text-slate-400">↔</span>
                    <span className="px-3 py-1 bg-purple-600 rounded text-white">{correlation.event2}</span>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-3">{correlation.description}</p>
                
                <div>
                  <span className="text-slate-400 text-sm">Historical Examples:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {correlation.examples.map((example, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-600 rounded text-xs text-white">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalytics;