import { useState, useEffect, useRef } from 'react';

export interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  speed: number;
  status: string;
}

export const useRealTimeTracking = (
  routeCoords: [number, number][],
  isActive: boolean = false
) => {
  const [currentPosition, setCurrentPosition] = 
    useState<[number, number] | null>(null);
  const [progress, setProgress] = useState(0);
  const [trackingHistory, setTrackingHistory] = 
    useState<TrackingPoint[]>([]);
  const [eta, setEta] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isActive || routeCoords.length < 2) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let currentIndex = 0;
    const totalPoints = routeCoords.length;

    intervalRef.current = setInterval(() => {
      if (currentIndex >= totalPoints - 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      currentIndex++;
      const position = routeCoords[currentIndex];
      setCurrentPosition(position);
      
      const progressPercent = 
        Math.round((currentIndex / totalPoints) * 100);
      setProgress(progressPercent);

      const remainingPoints = totalPoints - currentIndex;
      const etaMinutes = remainingPoints * 2;
      setEta(`${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m`);

      setTrackingHistory(prev => [...prev, {
        lat: position[0],
        lng: position[1],
        timestamp: new Date(),
        speed: Math.floor(Math.random() * 40) + 60,
        status: progressPercent < 50 ? 'In Transit' : 'Near Destination'
      }]);

    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, routeCoords]);

  const startTracking = () => {
    setProgress(0);
    setTrackingHistory([]);
    if (routeCoords.length > 0) {
      setCurrentPosition(routeCoords[0]);
    }
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return {
    currentPosition,
    progress,
    trackingHistory,
    eta,
    startTracking,
    stopTracking
  };
};
