import React, { useState, useEffect } from "react";
import { X, TrendingUp, DollarSign, Users, Wifi, Zap, Globe, Building, BarChart3, AlertTriangle } from "lucide-react";
import { CountryProfile as CountryProfileType, EconomicData, SocialMediaTrend, TransportationData } from "../../types/country";
import { countryService } from "../../services/countryService";

interface CountryProfileProps {
  countryCode: string;
  onClose: () => void;
}

const CountryProfile: React.FC<CountryProfileProps> = ({ countryCode, onClose }) => {
  const [profile, setProfile] = useState<CountryProfileType | null>(null);
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [socialTrends, setSocialTrends] = useState<SocialMediaTrend[]>([]);
  const [transportData, setTransportData] = useState<TransportationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'economy' | 'social' | 'transport'>('overview');

  useEffect(() => {
    const fetchCountryData = async () => {
      setLoading(true);
      try {
        const [profileData, economicInfo, socialData, transportInfo] = await Promise.all([
          countryService.getCountryProfile(countryCode),
          countryService.getEconomicData(countryCode),
          countryService.getSocialMediaTrends(countryCode),
          countryService.getTransportationData(countryCode)
        ]);

        setProfile(profileData);
        setEconomicData(economicInfo);
        setSocialTrends(socialData);
        setTransportData(transportInfo);
      } catch (error) {
        console.error("Error fetching country data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [countryCode]);

  if (loading) {
    return (
      <div className="h-full bg-slate-800 border-l border-slate-700 flex items-center justify-center">
        <div className="text-white">Loading country data...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full bg-slate-800 border-l border-slate-700 flex items-center justify-center">
        <div className="text-white">Country data not available</div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': case 'on-time': case 'active': return 'text-green-400';
      case 'disrupted': case 'delayed': case 'anchored': return 'text-yellow-400';
      case 'offline': case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">{profile.name}</h2>
          <p className="text-slate-400 text-sm">{profile.capital}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 flex-shrink-0">
        {[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'economy', label: 'Economy', icon: DollarSign },
          { id: 'social', label: 'Social', icon: TrendingUp },
          { id: 'transport', label: 'Transport', icon: Building }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Population:</span>
                  <span className="text-white">{formatNumber(profile.population)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GDP:</span>
                  <span className="text-white">${formatNumber(profile.gdp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency:</span>
                  <span className="text-white">{profile.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timezone:</span>
                  <span className="text-white">{profile.timezone}</span>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Demographics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Life Expectancy:</span>
                  <span className="text-white">{profile.demographics.lifeExpectancy} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Literacy Rate:</span>
                  <span className="text-white">{profile.demographics.literacyRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Urban Population:</span>
                  <span className="text-white">{profile.demographics.urbanPopulation}%</span>
                </div>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Wifi className="w-5 h-5 mr-2" />
                Infrastructure
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Internet Penetration:</span>
                  <span className="text-white">{profile.infrastructure.internetPenetration}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Penetration:</span>
                  <span className="text-white">{profile.infrastructure.mobilePenetration}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Electricity Access:</span>
                  <span className="text-white">{profile.infrastructure.electricityAccess}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'economy' && economicData && (
          <div className="space-y-6">
            {/* Stock Market */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Stock Market
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Index:</span>
                  <span className="text-white">{economicData.stockMarket.index}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Value:</span>
                  <span className="text-white">{economicData.stockMarket.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Change:</span>
                  <span className={economicData.stockMarket.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {economicData.stockMarket.change >= 0 ? '+' : ''}{economicData.stockMarket.change.toFixed(2)} 
                    ({economicData.stockMarket.changePercent >= 0 ? '+' : ''}{economicData.stockMarket.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Currency */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Currency
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Code:</span>
                  <span className="text-white">{economicData.currency.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rate (vs USD):</span>
                  <span className="text-white">{economicData.currency.rate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Change:</span>
                  <span className={economicData.currency.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {economicData.currency.change >= 0 ? '+' : ''}{economicData.currency.change.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trade Data */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Trade Balance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Exports:</span>
                  <span className="text-white">${formatNumber(economicData.tradeData.exports)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Imports:</span>
                  <span className="text-white">${formatNumber(economicData.tradeData.imports)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Balance:</span>
                  <span className={economicData.tradeData.tradeBalance >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${formatNumber(Math.abs(economicData.tradeData.tradeBalance))} 
                    {economicData.tradeData.tradeBalance >= 0 ? ' surplus' : ' deficit'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Topics
              </h3>
              {socialTrends.length > 0 ? (
                <div className="space-y-3">
                  {socialTrends.map((trend) => (
                    <div key={trend.id} className="border border-slate-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 font-medium">{trend.hashtag}</span>
                        <span className={`text-sm ${getSentimentColor(trend.sentiment)}`}>
                          {trend.sentiment}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        <div className="flex justify-between">
                          <span>Mentions:</span>
                          <span className="text-white">{formatNumber(trend.mentions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="text-white">{trend.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform:</span>
                          <span className="text-white">{trend.platform}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No trending topics available for this country.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transport' && transportData && (
          <div className="space-y-6">
            {/* Infrastructure Status */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Infrastructure Status
              </h3>
              <div className="space-y-3">
                {transportData.infrastructure.map((infra) => (
                  <div key={infra.id} className="border border-slate-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium capitalize">{infra.type}</span>
                      <span className={`text-sm ${getStatusColor(infra.status)}`}>
                        {infra.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{infra.description}</p>
                    {infra.affectedPopulation > 0 && (
                      <div className="text-sm text-slate-400">
                        <div className="flex justify-between">
                          <span>Affected:</span>
                          <span className="text-white">{formatNumber(infra.affectedPopulation)} people</span>
                        </div>
                        {infra.estimatedRepair && (
                          <div className="flex justify-between">
                            <span>Est. Repair:</span>
                            <span className="text-white">{infra.estimatedRepair}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Status */}
            {transportData.flights.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Flight Status</h3>
                <div className="space-y-3">
                  {transportData.flights.slice(0, 5).map((flight) => (
                    <div key={flight.id} className="border border-slate-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{flight.flightNumber}</span>
                        <span className={`text-sm ${getStatusColor(flight.status)}`}>
                          {flight.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        <div className="flex justify-between">
                          <span>Route:</span>
                          <span className="text-white">{flight.origin.code} → {flight.destination.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Airline:</span>
                          <span className="text-white">{flight.airline}</span>
                        </div>
                        {flight.delay && (
                          <div className="flex justify-between">
                            <span>Delay:</span>
                            <span className="text-yellow-400">{flight.delay} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryProfile;