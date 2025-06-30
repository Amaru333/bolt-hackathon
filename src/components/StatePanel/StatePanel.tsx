import React, { useState } from 'react';
import { X, MapPin, BarChart3, AlertTriangle, Newspaper, Camera, Users, DollarSign, Calendar, Star } from 'lucide-react';
import { Disaster, NewsArticle, TourismSpot } from '../../types/data';
import { US_STATES } from '../../data/states';
import { getDisasterColor, getSeverityColor } from '../../utils/mapUtils';
import { getCategoryColor, formatTimeAgo } from '../../utils/newsUtils';
import { formatPrice, getRatingStars } from '../../utils/tourismUtils';

interface StatePanelProps {
  stateCode: string;
  onClose: () => void;
  disasters: Disaster[];
  news: NewsArticle[];
  tourism: TourismSpot[];
}

const StatePanel: React.FC<StatePanelProps> = ({
  stateCode,
  onClose,
  disasters,
  news,
  tourism
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'disasters' | 'news' | 'tourism'>('overview');
  const state = US_STATES[stateCode];

  if (!state) {
    return (
      <div className="h-full bg-slate-800 border-l border-slate-700 flex items-center justify-center">
        <div className="text-white">State data not available</div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin, count: null },
    { id: 'disasters', label: 'Disasters', icon: AlertTriangle, count: disasters.length },
    { id: 'news', label: 'News', icon: Newspaper, count: news.length },
    { id: 'tourism', label: 'Tourism', icon: Camera, count: tourism.length }
  ];

  return (
    <div className="h-full bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">{state.name}</h2>
          <p className="text-slate-400 text-sm">{state.nickname}</p>
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
        {tabs.map(({ id, label, icon: Icon, count }) => (
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
            {count !== null && (
              <span className="ml-1 bg-slate-600 px-1.5 py-0.5 rounded-full text-xs">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capital:</span>
                  <span className="text-white">{state.capital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Population:</span>
                  <span className="text-white">{formatNumber(state.population)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Area:</span>
                  <span className="text-white">{formatNumber(state.area)} sq mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Founded:</span>
                  <span className="text-white">{state.founded}</span>
                </div>
              </div>
            </div>

            {/* Economy */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Economy
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">GDP:</span>
                  <span className="text-white">${formatNumber(state.economy.gdp)}B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unemployment:</span>
                  <span className="text-white">{state.economy.unemploymentRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Major Industries:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {state.economy.majorIndustries.map((industry, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-600 rounded text-xs text-white">
                        {industry}
                      </span>
                    ))}
                  </div>
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
                  <span className="text-slate-400">Median Age:</span>
                  <span className="text-white">{state.demographics.medianAge} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Median Income:</span>
                  <span className="text-white">${formatNumber(state.demographics.medianIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Education:</span>
                  <span className="text-white">{state.demographics.educationLevel}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-600 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{disasters.length}</div>
                <div className="text-xs text-red-100">Disasters</div>
              </div>
              <div className="bg-green-600 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{news.length}</div>
                <div className="text-xs text-green-100">News</div>
              </div>
              <div className="bg-purple-600 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{tourism.length}</div>
                <div className="text-xs text-purple-100">Tourism</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'disasters' && (
          <div className="space-y-4">
            {disasters.length > 0 ? (
              disasters.map((disaster) => (
                <div key={disaster.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{disaster.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        disaster.status === 'active' ? 'bg-red-500' : 
                        disaster.status === 'contained' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    >
                      {disaster.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{disaster.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white capitalize">{disaster.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Severity:</span>
                      <span 
                        className="px-1 py-0.5 rounded text-white text-xs"
                        style={{ backgroundColor: getSeverityColor(disaster.severity) }}
                      >
                        {disaster.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-white">{new Date(disaster.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No disasters reported in {state.name}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-4">
            {news.length > 0 ? (
              news.map((article) => (
                <div key={article.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white leading-tight">{article.title}</h4>
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
                  <p className="text-slate-300 text-sm mb-3">{article.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source:</span>
                      <span className="text-white">{article.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Published:</span>
                      <span className="text-white">{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Relevance:</span>
                      <span className="text-white">{article.localRelevance}/10</span>
                    </div>
                  </div>
                  {article.url && article.url !== '#' && (
                    <button
                      onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                    >
                      Read Article
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No news articles for {state.name}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tourism' && (
          <div className="space-y-4">
            {tourism.length > 0 ? (
              tourism.map((spot) => (
                <div key={spot.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{spot.name}</h4>
                    <div className="flex items-center">
                      {getRatingStars(spot.rating)}
                      <span className="ml-1 text-sm text-white">{spot.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{spot.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white capitalize">{spot.category.replace('_', ' ')}</span>
                    </div>
                    {spot.entryFee !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Entry Fee:</span>
                        <span className="text-white">{formatPrice(spot.entryFee)}</span>
                      </div>
                    )}
                    {spot.visitorsPerYear && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Annual Visitors:</span>
                        <span className="text-white">{formatNumber(spot.visitorsPerYear)}</span>
                      </div>
                    )}
                  </div>
                  {spot.amenities.length > 0 && (
                    <div className="mt-3">
                      <span className="text-slate-400 text-xs">Amenities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {spot.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-600 rounded text-xs text-white">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {spot.website && (
                    <button
                      onClick={() => window.open(spot.website, '_blank', 'noopener,noreferrer')}
                      className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded transition-colors"
                    >
                      Visit Website
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tourism spots listed for {state.name}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatePanel;