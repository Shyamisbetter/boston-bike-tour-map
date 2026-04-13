/**
 * Home: Full-bleed map page with glassmorphism sidebar overlay.
 * Design: Cartographic Modernism — dark map, frosted glass panels, neon accents.
 */
import { useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useMapData } from "@/hooks/useMapData";
import BikeMap from "@/components/BikeMap";
import Sidebar from "@/components/Sidebar";
import type { CertType, BikeInfraType } from "@/lib/types";

const ALL_CERTS: CertType[] = ["LEED", "WELL", "LBC", "Passive House", "GBS"];
const ALL_INFRA: BikeInfraType[] = [
  "separated",
  "buffered",
  "lane",
  "shared_path",
  "shared_lane",
  "contraflow",
];

export default function Home() {
  const { buildings, bikeInfra, routes, loading, error } = useMapData();

  const [activeRoute, setActiveRoute] = useState<number | null>(null);
  const [visibleCerts, setVisibleCerts] = useState<Set<string>>(
    () => new Set(ALL_CERTS)
  );
  const [visibleInfra, setVisibleInfra] = useState<Set<string>>(
    () => new Set(ALL_INFRA)
  );
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCert = useCallback((cert: string) => {
    setVisibleCerts((prev) => {
      const next = new Set(prev);
      if (next.has(cert)) {
        next.delete(cert);
      } else {
        next.add(cert);
      }
      return next;
    });
  }, []);

  const toggleInfra = useCallback((infra: string) => {
    setVisibleInfra((prev) => {
      const next = new Set(prev);
      if (next.has(infra)) {
        next.delete(infra);
      } else {
        next.add(infra);
      }
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Loading map data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="glass-panel p-8 max-w-md text-center">
          <h2
            className="text-lg font-bold text-destructive mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Failed to load map data
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Full-bleed map */}
      <BikeMap
        buildings={buildings}
        bikeInfra={bikeInfra}
        routes={routes}
        activeRoute={activeRoute}
        visibleCerts={visibleCerts}
        visibleInfra={visibleInfra}
        searchQuery={searchQuery}
      />

      {/* Glassmorphism sidebar overlay */}
      <Sidebar
        buildings={buildings}
        routes={routes}
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        visibleCerts={visibleCerts}
        toggleCert={toggleCert}
        visibleInfra={visibleInfra}
        toggleInfra={toggleInfra}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
}
