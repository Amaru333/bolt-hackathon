import { useState, useEffect, useCallback } from "react";
import { CountryProfile, DataLayer } from "../types/country";
import { countryService } from "../services/countryService";

export const useCountryData = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([]);
  const [loading, setLoading] = useState(false);

  // Load available data layers
  useEffect(() => {
    const loadDataLayers = async () => {
      try {
        const layers = await countryService.getDataLayers();
        setDataLayers(layers);
      } catch (error) {
        console.error("Error loading data layers:", error);
      }
    };

    loadDataLayers();
  }, []);

  const selectCountry = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
  }, []);

  const clearCountrySelection = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  const toggleDataLayer = useCallback((layerId: string) => {
    setDataLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  }, []);

  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setDataLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, opacity }
          : layer
      )
    );
  }, []);

  const getCountryFromCoordinates = useCallback((lat: number, lng: number): string | null => {
    return countryService.getCountryFromCoordinates(lat, lng);
  }, []);

  return {
    selectedCountry,
    dataLayers,
    loading,
    selectCountry,
    clearCountrySelection,
    toggleDataLayer,
    updateLayerOpacity,
    getCountryFromCoordinates,
  };
};