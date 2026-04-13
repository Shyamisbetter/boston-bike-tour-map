import { useState, useEffect } from "react";
import type { Building, BikeRoute } from "@/lib/types";
import { DATA_URLS } from "@/lib/types";

export interface BikeInfraData {
  [key: string]: { coordinates: number[][] }[];
}

interface MapData {
  buildings: Building[];
  bikeInfra: BikeInfraData;
  routes: BikeRoute[];
  loading: boolean;
  error: string | null;
}

export function useMapData(): MapData {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [bikeInfra, setBikeInfra] = useState<BikeInfraData>({});
  const [routes, setRoutes] = useState<BikeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [bRes, iRes, rRes] = await Promise.all([
          fetch(DATA_URLS.buildings),
          fetch(DATA_URLS.bikeInfra),
          fetch(DATA_URLS.routes),
        ]);

        if (!bRes.ok || !iRes.ok || !rRes.ok) {
          throw new Error("Failed to fetch map data");
        }

        const [bData, iData, rData] = await Promise.all([
          bRes.json(),
          iRes.json(),
          rRes.json(),
        ]);

        if (!cancelled) {
          setBuildings(bData);
          setBikeInfra(iData);
          setRoutes(rData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return { buildings, bikeInfra, routes, loading, error };
}
