import { NewsCategory } from '../types/data';

export const getCategoryColor = (category: NewsCategory): string => {
  const colors = {
    breaking: '#DC2626', // Red
    politics: '#7C3AED', // Purple
    business: '#059669', // Green
    technology: '#3B82F6', // Blue
    health: '#EC4899', // Pink
    sports: '#EA580C', // Orange
    entertainment: '#8B5CF6', // Violet
    weather: '#06B6D4', // Cyan
  };
  return colors[category] || '#6B7280';
};

export const getNewsIcon = (category: NewsCategory): string => {
  const icons = {
    breaking: '🚨',
    politics: '🏛️',
    business: '💼',
    technology: '💻',
    health: '🏥',
    sports: '⚽',
    entertainment: '🎬',
    weather: '🌤️',
  };
  return icons[category] || '📰';
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return publishedDate.toLocaleDateString();
};