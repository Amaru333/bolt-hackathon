import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { DataFetchStatus } from '../../types/api';

interface DataStatusProps {
  status: DataFetchStatus;
  isLoading: boolean;
  onRefresh: () => void;
  onClearErrors: () => void;
  lastUpdated: Record<string, number>;
}

const DataStatus: React.FC<DataStatusProps> = ({
  status,
  isLoading,
  onRefresh,
  onClearErrors,
  lastUpdated
}) => {
  const formatLastUpdated = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const hasErrors = status.errors.length > 0;
  const allSuccess = status.earthquakes === 'success' && status.fires === 'success' && status.weather === 'success';

  return (
    <div className="bg-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center">
          {allSuccess && !hasErrors ? (
            <Wifi className="w-4 h-4 mr-2 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 mr-2 text-red-400" />
          )}
          Data Sources
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 rounded hover:bg-slate-600 transition-colors disabled:opacity-50"
          title="Refresh all data"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            {getStatusIcon(status.earthquakes)}
            <span className="ml-2 text-slate-300">USGS Earthquakes</span>
          </div>
          <span className="text-slate-400">
            {formatLastUpdated(lastUpdated.earthquakes)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            {getStatusIcon(status.fires)}
            <span className="ml-2 text-slate-300">NASA Fire Data</span>
          </div>
          <span className="text-slate-400">
            {formatLastUpdated(lastUpdated.fires)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            {getStatusIcon(status.weather)}
            <span className="ml-2 text-slate-300">Weather Alerts</span>
          </div>
          <span className="text-slate-400">
            {formatLastUpdated(lastUpdated.weather)}
          </span>
        </div>
      </div>

      {hasErrors && (
        <div className="border-t border-slate-600 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-red-400">Errors</span>
            <button
              onClick={onClearErrors}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {status.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-300 bg-red-900/20 rounded p-2">
                <div className="font-medium">{error.source}</div>
                <div className="text-red-400">{error.error}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400 border-t border-slate-600 pt-2">
        Auto-refresh every 5 minutes
      </div>
    </div>
  );
};

export default DataStatus;