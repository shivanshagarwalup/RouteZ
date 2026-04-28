import axios from 'axios';

export const getRealRoute = async (
  sourceCoords: [number, number],
  destCoords: [number, number]
): Promise<{
  coordinates: [number, number][],
  distance: number,
  duration: number
}> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
    if (!apiKey) throw new Error('ORS API key missing');

    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [
          [sourceCoords[1], sourceCoords[0]],
          [destCoords[1], destCoords[0]]
        ]
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10s timeout
      }
    );

    const route = response.data.features[0];
    const coords = route.geometry.coordinates.map(
      (c: number[]) => [c[1], c[0]] as [number, number]
    );
    
    return {
      coordinates: coords,
      distance: Math.round(route.properties.summary.distance / 1000), // m to km
      duration: Math.round(route.properties.summary.duration / 3600 * 10) / 10 // s to hrs
    };
  } catch (error: any) {
    console.warn('Real route generation failed:', error.message);
    throw new Error('Route generation failed');
  }
};

// Keeping getRoute for backward compatibility if needed, but aliasing to real route logic
export const getRoute = async (sourceCoords: [number, number], destCoords: [number, number]) => {
  try {
    const data = await getRealRoute(sourceCoords, destCoords);
    return {
      geometry: data.coordinates,
      distance: data.distance * 1000,
      duration: data.duration * 3600
    };
  } catch (err) {
    throw err;
  }
};
