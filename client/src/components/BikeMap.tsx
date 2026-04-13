/**
 * BikeMap: Full-bleed Leaflet map with all building markers, bike infrastructure, and routes.
 * Design: Cartographic Modernism — dark tiles, neon accents, glass panels.
 */
import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import type { Building, BikeRoute, CertType, BikeInfraType } from "@/lib/types";
import { CERT_COLORS, BIKE_INFRA_COLORS } from "@/lib/types";
import type { BikeInfraData } from "@/hooks/useMapData";

interface BikeMapProps {
  buildings: Building[];
  bikeInfra: BikeInfraData;
  routes: BikeRoute[];
  activeRoute: number | null;
  visibleCerts: Set<string>;
  visibleInfra: Set<string>;
  searchQuery: string;
  onBuildingClick?: (building: Building) => void;
}

function createBuildingIcon(certType: CertType): L.DivIcon {
  const color = CERT_COLORS[certType] || "#888";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 14px; height: 14px; border-radius: 50%;
      background: ${color}; border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 0 8px ${color}80, 0 2px 4px rgba(0,0,0,0.4);
      transition: transform 0.15s ease;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createRouteStopIcon(
  index: number,
  color: string
): L.DivIcon {
  return L.divIcon({
    className: "route-stop-marker",
    html: `<div style="
      width: 26px; height: 26px; border-radius: 50%;
      background: white; border: 3px solid ${color};
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 11px; color: ${color};
      font-family: 'Space Grotesk', sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">${index + 1}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function BikeMap({
  buildings,
  bikeInfra,
  routes,
  activeRoute,
  visibleCerts,
  visibleInfra,
  searchQuery,
  onBuildingClick,
}: BikeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const infraLayersRef = useRef<Map<string, L.LayerGroup>>(new Map());
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [42.358, -71.068],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Zoom control in bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add building markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || buildings.length === 0) return;

    // Remove old cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 16,
    });

    const markers = new Map<string, L.Marker>();

    buildings.forEach((b) => {
      if (!visibleCerts.has(b.CertType)) return;

      const matchesSearch =
        !searchQuery ||
        b.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.Address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.Category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return;

      const marker = L.marker([b.lat, b.lng], {
        icon: createBuildingIcon(b.CertType as CertType),
      });

      const certColor = CERT_COLORS[b.CertType as CertType] || "#888";
      marker.bindPopup(
        `<div style="font-family: 'Space Grotesk', sans-serif; min-width: 200px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px; color: #fff;">${b.Name}</div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${certColor}20; color: ${certColor}; font-size: 11px; font-weight: 600; border: 1px solid ${certColor}40; margin-bottom: 6px;">${b.Category}</div>
          <div style="font-size: 12px; color: #aaa; margin-bottom: 4px;">${b.Address}</div>
          <div style="font-size: 11px; color: #777;">Year: ${b.Year?.replace(".0", "") || "N/A"}</div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.Address)}&travelmode=bicycling" target="_blank" rel="noopener" style="display: inline-block; margin-top: 8px; padding: 4px 10px; background: ${certColor}; color: #1a1a2e; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 600;">Cycling Directions</a>
        </div>`,
        { maxWidth: 280 }
      );

      marker.on("click", () => onBuildingClick?.(b));
      cluster.addLayer(marker);
      markers.set(`${b.lat}-${b.lng}-${b.Name}`, marker);
    });

    map.addLayer(cluster);
    clusterGroupRef.current = cluster;
    markersRef.current = markers;
  }, [buildings, visibleCerts, searchQuery, onBuildingClick]);

  // Add bike infrastructure layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || Object.keys(bikeInfra).length === 0) return;

    // Remove old layers
    infraLayersRef.current.forEach((layer) => map.removeLayer(layer));
    infraLayersRef.current.clear();

    Object.entries(bikeInfra).forEach(([type, segments]) => {
      if (!visibleInfra.has(type)) return;

      const color = BIKE_INFRA_COLORS[type as BikeInfraType] || "#888";
      const isShared = type === "shared_lane";
      const layerGroup = L.layerGroup();

      segments.forEach((seg) => {
        const coords: L.LatLngExpression[] = seg.coordinates.map(
          (c) => [c[1], c[0]] as L.LatLngExpression
        );
        L.polyline(coords, {
          color,
          weight: isShared ? 2 : 3,
          opacity: 0.55,
          dashArray: isShared ? "6 4" : undefined,
        }).addTo(layerGroup);
      });

      layerGroup.addTo(map);
      infraLayersRef.current.set(type, layerGroup);
    });
  }, [bikeInfra, visibleInfra]);

  // Add active route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old route layer
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoute === null || !routes[activeRoute]) return;

    const route = routes[activeRoute];
    const routeLayer = L.layerGroup();

    // Draw route line
    const waypoints: L.LatLngExpression[] = route.waypoints.map(
      (wp) => [wp.lat, wp.lng] as L.LatLngExpression
    );
    if (waypoints.length > 1) {
      // Glow effect
      L.polyline(waypoints, {
        color: route.color,
        weight: 8,
        opacity: 0.25,
      }).addTo(routeLayer);
      // Main line
      L.polyline(waypoints, {
        color: route.color,
        weight: 4,
        opacity: 0.9,
        dashArray: "10 6",
        className: "route-line-animated",
      }).addTo(routeLayer);
    }

    // Add stop markers
    route.stops.forEach((stop, i) => {
      const marker = L.marker([stop.lat, stop.lng], {
        icon: createRouteStopIcon(i, route.color),
        zIndexOffset: 1000,
      });
      const certColor =
        CERT_COLORS[stop.CertType as CertType] || "#888";
      marker.bindPopup(
        `<div style="font-family: 'Space Grotesk', sans-serif;">
          <div style="font-size: 13px; font-weight: 600; color: #fff;">Stop ${i + 1}: ${stop.Name}</div>
          <div style="display: inline-block; padding: 2px 6px; border-radius: 3px; background: ${certColor}20; color: ${certColor}; font-size: 10px; font-weight: 600; border: 1px solid ${certColor}40; margin-top: 4px;">${stop.Category}</div>
        </div>`
      );
      marker.addTo(routeLayer);
    });

    routeLayer.addTo(map);
    routeLayerRef.current = routeLayer;

    // Fit bounds to route
    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints);
      route.stops.forEach((s) => bounds.extend([s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [activeRoute, routes]);

  const handleFitAll = useCallback(() => {
    if (mapRef.current && buildings.length > 0) {
      const bounds = L.latLngBounds(buildings.map((b) => [b.lat, b.lng]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [buildings]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
