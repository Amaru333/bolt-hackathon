import { CatastropheType } from "../types/catastrophe";

export const getCatastropheColor = (type: CatastropheType): string => {
  const colors = {
    earthquake: "#F97316", // Orange
    fire: "#EF4444", // Red
    flood: "#3B82F6", // Blue
    hurricane: "#8B5CF6", // Purple
    tornado: "#EC4899", // Pink
    volcano: "#DC2626", // Dark Red
    accident: "#6B7280", // Gray
    drought: "#A16207", // Amber
    landslide: "#92400E", // Brown
    tsunami: "#0891B2", // Cyan
    air_quality: "#059669", // Emerald
  };
  return colors[type] || "#6B7280";
};

export const getCatastropheIcon = (type: CatastropheType): string => {
  const icons = {
    earthquake: "🏔️",
    fire: "🔥",
    flood: "🌊",
    hurricane: "🌀",
    tornado: "🌪️",
    volcano: "🌋",
    accident: "⚠️",
    drought: "🏜️",
    landslide: "⛰️",
    tsunami: "🌊",
    air_quality: "😷",
  };
  return icons[type] || "📍";
};

export const getSeverityColor = (severity: "low" | "medium" | "high" | "critical"): string => {
  const colors = {
    low: "#10B981", // Green
    medium: "#F59E0B", // Yellow
    high: "#EF4444", // Red
    critical: "#991B1B", // Dark Red
  };
  return colors[severity] || "#6B7280";
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};
