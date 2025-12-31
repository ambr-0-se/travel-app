
import { getWeatherIcon } from '../constants';

export interface WeatherData {
  high: number;
  low: number;
  condition: string;
  conditionIcon: string;
  reportUrl: string;
  lastUpdated?: number;
}

const CACHE_KEY_PREFIX = 'weather_cache_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const googleWeatherUrl = (place: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`weather ${place}`)}`;

// Map location names to coordinates for weather API
const LOCATION_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  'Dubai, UAE': { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
  'Abu Dhabi, UAE': { lat: 24.4539, lon: 54.3773, name: 'Abu Dhabi' },
  'Muscat, Oman': { lat: 23.5859, lon: 58.4059, name: 'Muscat' },
  'Nizwa, Oman': { lat: 22.9333, lon: 57.5333, name: 'Nizwa' },
  'Jebel Akhdar, Oman': { lat: 23.1167, lon: 57.2833, name: 'Jebel Akhdar' },
  'Wahiba Sands, Oman': { lat: 22.5, lon: 58.5, name: 'Wahiba Sands' },
};

// Get cached weather data (fresh only)
const getCachedWeatherFresh = (location: string): WeatherData | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${location}`);
    if (!cached) return null;
    
    const data: WeatherData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 1 hour)
    if (data.lastUpdated && (now - data.lastUpdated) < CACHE_DURATION) {
      return data;
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

// Get cached weather data (stale allowed). Used for offline fallback: "use the most recent retrieved data".
const getCachedWeatherAny = (location: string): WeatherData | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${location}`);
    if (!cached) return null;
    return JSON.parse(cached) as WeatherData;
  } catch {
    return null;
  }
};

// Save weather data to cache
const saveCachedWeather = (location: string, data: WeatherData): void => {
  try {
    const dataWithTimestamp = { ...data, lastUpdated: Date.now() };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${location}`, JSON.stringify(dataWithTimestamp));
  } catch (e) {
    console.error('Failed to save weather cache', e);
  }
};

// Fetch weather from wttr.in (no API key required, works offline-friendly)
const fetchWeatherFromAPI = async (location: string): Promise<WeatherData | null> => {
  const coords = LOCATION_COORDS[location];
  if (!coords) return null;

  try {
    // Use wttr.in API - simple and doesn't require API key
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(coords.name)}?format=j1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    // Extract current weather and forecast
    const current = data.current_condition?.[0];
    const today = data.weather?.[0];
    
    if (!current || !today) {
      throw new Error('Invalid weather data format');
    }

    const high = parseInt(today.maxtempC) || parseInt(current.temp_C);
    const low = parseInt(today.mintempC) || parseInt(current.temp_C);
    const condition = current.weatherDesc?.[0]?.value || current.weatherDesc || 'Clear';
    const conditionIcon = getWeatherIcon(condition);

    return {
      high: Math.round(high),
      low: Math.round(low),
      condition,
      conditionIcon,
      reportUrl: googleWeatherUrl(location),
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
};

// Check if online
const isOnline = (): boolean => {
  return navigator.onLine;
};

// Main function to get weather data
export const getWeatherData = async (location: string): Promise<WeatherData | null> => {
  // Cached (any age) is our offline fallback
  const cachedAny = getCachedWeatherAny(location);
  
  // If online, try to fetch fresh data
  if (isOnline()) {
    try {
      const fresh = await fetchWeatherFromAPI(location);
      if (fresh) {
        // Save fresh data to cache
        saveCachedWeather(location, fresh);
        return fresh;
      }
    } catch (error) {
      console.error('Failed to fetch fresh weather, using cache if available:', error);
    }
  }
  
  // Offline (or fetch failed): return the most recently cached data, even if old.
  return cachedAny;
};

// Batch fetch weather for multiple locations
export const getWeatherForLocations = async (
  locations: string[]
): Promise<Record<string, WeatherData | null>> => {
  const results: Record<string, WeatherData | null> = {};
  
  // Fetch all in parallel
  const promises = locations.map(async (location) => {
    const weather = await getWeatherData(location);
    return { location, weather };
  });
  
  const resolved = await Promise.all(promises);
  resolved.forEach(({ location, weather }) => {
    results[location] = weather;
  });
  
  return results;
};

