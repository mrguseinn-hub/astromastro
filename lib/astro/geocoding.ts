import { Location } from '@/types';

// OpenStreetMap Nominatim API (free, no limits)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export async function geocodeLocation(query: string): Promise<Location[]> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const results = await response.json();

    return results.map((result: any) => ({
      city: result.display_name.split(',')[0],
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

// Reverse geocoding (coordinates to city name)
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const result = await response.json();
    return result.display_name?.split(',')[0] || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}