import { DisasterType } from '../types/data';

export const getDisasterColor = (type: DisasterType): string => {
  const colors = {
    earthquake: '#F97316', // Orange
    wildfire: '#EF4444', // Red
    flood: '#3B82F6', // Blue
    hurricane: '#8B5CF6', // Purple
    tornado: '#EC4899', // Pink
    drought: '#A16207', // Amber
    winter_storm: '#06B6D4', // Cyan
    heat_wave: '#DC2626', // Dark Red
  };
  return colors[type] || '#6B7280';
};

export const getDisasterIcon = (type: DisasterType): string => {
  const icons = {
    earthquake: '🏔️',
    wildfire: '🔥',
    flood: '🌊',
    hurricane: '🌀',
    tornado: '🌪️',
    drought: '🏜️',
    winter_storm: '❄️',
    heat_wave: '🌡️',
  };
  return icons[type] || '⚠️';
};

export const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
  const colors = {
    low: '#10B981', // Green
    medium: '#F59E0B', // Yellow
    high: '#EF4444', // Red
    critical: '#991B1B', // Dark Red
  };
  return colors[severity] || '#6B7280';
};