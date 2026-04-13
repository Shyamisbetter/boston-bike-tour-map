/**
 * Sidebar: Frosted glass collapsible panel with routes, legend, search, and stats.
 * Design: Cartographic Modernism — glassmorphism, neon accents, Space Grotesk typography.
 */
import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Ruler,
  Bike,
  Building2,
  Eye,
  EyeOff,
  Layers,
  Route,
  Info,
} from "lucide-react";
import type { Building, BikeRoute, CertType, BikeInfraType } from "@/lib/types";
import {
  CERT_COLORS,
  CERT_LABELS,
  BIKE_INFRA_COLORS,
  BIKE_INFRA_LABELS,
} from "@/lib/types";

interface SidebarProps {
  buildings: Building[];
  routes: BikeRoute[];
  activeRoute: number | null;
  setActiveRoute: (idx: number | null) => void;
  visibleCerts: Set<string>;
  toggleCert: (cert: string) => void;
  visibleInfra: Set<string>;
  toggleInfra: (infra: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

type Tab = "routes" | "legend" | "info";

export default function Sidebar({
  buildings,
  routes,
  activeRoute,
  setActiveRoute,
  visibleCerts,
  toggleCert,
  visibleInfra,
  toggleInfra,
  searchQuery,
  setSearchQuery,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("routes");

  const certCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    buildings.forEach((b) => {
      counts[b.CertType] = (counts[b.CertType] || 0) + 1;
    });
    return counts;
  }, [buildings]);

  const filteredBuildings = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return buildings
      .filter(
        (b) =>
          b.Name.toLowerCase().includes(q) ||
          b.Address.toLowerCase().includes(q) ||
          b.Category.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [buildings, searchQuery]);

  if (collapsed) {
    return (
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => setCollapsed(false)}
          className="glass-panel p-3 hover:bg-white/5 transition-colors"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 bottom-4 z-[1000] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col glass-panel overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Boston Bike Tour 2026
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {buildings.length} certified green buildings
            </p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search buildings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-input/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Search results */}
        {searchQuery && filteredBuildings.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto sidebar-scroll">
            {filteredBuildings.map((b, i) => {
              const color = CERT_COLORS[b.CertType as CertType] || "#888";
              return (
                <div
                  key={`${b.Name}-${i}`}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {b.Name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {b.Category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border/50 flex-shrink-0">
        {(
          [
            { key: "routes", icon: Route, label: "Routes" },
            { key: "legend", icon: Layers, label: "Layers" },
            { key: "info", icon: Info, label: "About" },
          ] as const
        ).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-4">
        {activeTab === "routes" && (
          <RoutesTab
            routes={routes}
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
          />
        )}
        {activeTab === "legend" && (
          <LegendTab
            certCounts={certCounts}
            visibleCerts={visibleCerts}
            toggleCert={toggleCert}
            visibleInfra={visibleInfra}
            toggleInfra={toggleInfra}
          />
        )}
        {activeTab === "info" && <InfoTab buildingCount={buildings.length} />}
      </div>
    </div>
  );
}

/* ---------- Routes Tab ---------- */
function RoutesTab({
  routes,
  activeRoute,
  setActiveRoute,
}: {
  routes: BikeRoute[];
  activeRoute: number | null;
  setActiveRoute: (idx: number | null) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-2">
        4 beginner-friendly routes along official bike infrastructure. Click to
        highlight on map.
      </p>
      {routes.map((route, idx) => {
        const isActive = activeRoute === idx;
        return (
          <button
            key={route.name}
            onClick={() => setActiveRoute(isActive ? null : idx)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              isActive
                ? "border-white/20 bg-white/5"
                : "border-border/30 hover:border-border/60 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  background: route.color,
                  boxShadow: isActive
                    ? `0 0 8px ${route.color}80`
                    : "none",
                }}
              />
              <span
                className="text-sm font-semibold truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {route.name}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
              {route.description}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                {route.distance_mi} mi
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(route.est_time_min / 60 * 10) / 10}h
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {route.num_stops} stops
              </span>
            </div>
            {isActive && (
              <div className="mt-2 pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground mb-1">
                  {route.difficulty}
                </p>
                <div className="space-y-1">
                  {route.stops.map((stop, i) => {
                    const color =
                      CERT_COLORS[stop.CertType as CertType] || "#888";
                    return (
                      <div
                        key={`${stop.Name}-${i}`}
                        className="flex items-center gap-2 text-[10px]"
                      >
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                          style={{
                            border: `2px solid ${route.color}`,
                            color: route.color,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="truncate">{stop.Name}</span>
                        <span
                          className="ml-auto text-[8px] px-1 py-0.5 rounded flex-shrink-0"
                          style={{
                            background: `${color}20`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {stop.CertType}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Legend Tab ---------- */
function LegendTab({
  certCounts,
  visibleCerts,
  toggleCert,
  visibleInfra,
  toggleInfra,
}: {
  certCounts: Record<string, number>;
  visibleCerts: Set<string>;
  toggleCert: (cert: string) => void;
  visibleInfra: Set<string>;
  toggleInfra: (infra: string) => void;
}) {
  const certTypes: CertType[] = ["LEED", "WELL", "LBC", "Passive House", "GBS"];
  const infraTypes: BikeInfraType[] = [
    "separated",
    "buffered",
    "lane",
    "shared_path",
    "shared_lane",
    "contraflow",
  ];

  return (
    <div className="space-y-5">
      {/* Building certifications */}
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" />
          Building Certifications
        </h3>
        <div className="space-y-1">
          {certTypes.map((cert) => {
            const color = CERT_COLORS[cert];
            const visible = visibleCerts.has(cert);
            const count = certCounts[cert] || 0;
            return (
              <button
                key={cert}
                onClick={() => toggleCert(cert)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-all ${
                  visible
                    ? "hover:bg-white/5"
                    : "opacity-40 hover:opacity-60"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: color,
                    boxShadow: visible
                      ? `0 0 6px ${color}60`
                      : "none",
                  }}
                />
                <span className="flex-1 text-left">
                  {CERT_LABELS[cert]}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {count}
                </span>
                {visible ? (
                  <Eye className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bike infrastructure */}
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"
        >
          <Bike className="w-3.5 h-3.5" />
          Bike Infrastructure
        </h3>
        <div className="space-y-1">
          {infraTypes.map((infra) => {
            const color = BIKE_INFRA_COLORS[infra];
            const visible = visibleInfra.has(infra);
            const isShared = infra === "shared_lane";
            return (
              <button
                key={infra}
                onClick={() => toggleInfra(infra)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-all ${
                  visible
                    ? "hover:bg-white/5"
                    : "opacity-40 hover:opacity-60"
                }`}
              >
                <div className="w-5 flex-shrink-0 flex items-center">
                  <div
                    className="w-full h-0.5"
                    style={{
                      background: color,
                      borderTop: isShared
                        ? `2px dashed ${color}`
                        : `2px solid ${color}`,
                    }}
                  />
                </div>
                <span className="flex-1 text-left">
                  {BIKE_INFRA_LABELS[infra]}
                </span>
                {visible ? (
                  <Eye className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Info Tab ---------- */
function InfoTab({ buildingCount }: { buildingCount: number }) {
  return (
    <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
      <div>
        <h3
          className="text-sm font-semibold text-foreground mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          About This Map
        </h3>
        <p>
          This interactive map showcases <strong className="text-foreground">{buildingCount} certified green buildings</strong> in
          Boston and Cambridge, plotted along official bike infrastructure. It
          was created for the 2026 Boston Bike Tour to help cyclists explore
          sustainable architecture while riding on safe, designated bike routes.
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-foreground mb-1">
          Certification Types
        </h4>
        <ul className="space-y-1">
          <li>
            <strong className="text-[#39d353]">LEED</strong> — Leadership in
            Energy and Environmental Design
          </li>
          <li>
            <strong className="text-[#58a6ff]">WELL</strong> — WELL Building
            Standard (health &amp; wellness)
          </li>
          <li>
            <strong className="text-[#f97316]">LBC</strong> — Living Building
            Challenge (regenerative design)
          </li>
          <li>
            <strong className="text-[#a855f7]">Passive House</strong> — Ultra-low
            energy building standard
          </li>
          <li>
            <strong className="text-[#ef4444]">GBS</strong> — Green Building
            Showroom (2019-2025)
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-foreground mb-1">
          Route Design
        </h4>
        <p>
          All 4 routes are designed for beginner cyclists at a comfortable 8-10
          mph pace, staying on official bike infrastructure (separated lanes,
          buffered lanes, shared-use paths, and shared lanes). Each route is
          approximately 3 hours including stop time.
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-foreground mb-1">
          Data Sources
        </h4>
        <ul className="space-y-0.5">
          <li>Bike network: Analyze Boston 2024, Cambridge GIS</li>
          <li>Buildings: USGBC, IWBI, ILFI, PHIUS, GBS databases</li>
          <li>Geocoding: OpenStreetMap Nominatim</li>
        </ul>
      </div>

      <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground/60">
        Built for the 2026 Boston Bike Tour Planning Committee
      </div>
    </div>
  );
}
