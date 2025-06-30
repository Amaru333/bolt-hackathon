import React from 'react';
import { TourismCategory } from '../types/data';

export const getTourismIcon = (category: TourismCategory): string => {
  const icons = {
    national_park: '🏞️',
    monument: '🗽',
    museum: '🏛️',
    beach: '🏖️',
    mountain: '⛰️',
    city_attraction: '🏙️',
    historical_site: '🏰',
    entertainment: '🎢',
    shopping: '🛍️',
    restaurant: '🍽️',
  };
  return icons[category] || '📍';
};

export const getRatingStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('⭐');
  }
  
  if (hasHalfStar) {
    stars.push('⭐');
  }
  
  return stars.join('');
};

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Free';
  return `$${price}`;
};