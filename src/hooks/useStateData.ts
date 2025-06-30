import { useState, useCallback } from 'react';
import { US_STATES } from '../data/states';

export const useStateData = () => {
  const [stateInfo] = useState(US_STATES);

  const getStateFromCoordinates = useCallback((lat: number, lng: number): string | null => {
    // Simple state detection based on coordinates
    for (const [code, state] of Object.entries(US_STATES)) {
      const bounds = state.bounds;
      if (lat >= bounds.south && lat <= bounds.north && 
          lng >= bounds.west && lng <= bounds.east) {
        return code;
      }
    }
    return null;
  }, []);

  return {
    stateInfo,
    getStateFromCoordinates
  };
};