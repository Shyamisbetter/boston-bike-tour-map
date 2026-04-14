export interface Building {
  Name: string;
  Address: string;
  Year: string;
  Category: string;
  CertType: string;
  lat: number;
  lng: number;
}

export interface RouteStop {
  Name: string;
  Address: string;
  Year: string;
  Category: string;
  CertType: string;
  lat: number;
  lng: number;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  label: string;
}

export interface BikeRoute {
  name: string;
  color: string;
  description: string;
  difficulty: string;
  bike_infra: string;
  start: string;
  distance_mi: number;
  est_time_min: number;
  num_stops: number;
  waypoints: RouteWaypoint[];
  stops: RouteStop[];
}

export type CertType = "LEED" | "WELL" | "LBC" | "Passive House" | "GBS";

export type BikeInfraType =
  | "separated"
  | "buffered"
  | "lane"
  | "shared_path"
  | "shared_lane"
  | "contraflow";

export const CERT_COLORS: Record<CertType, string> = {
  LEED: "#39d353",
  WELL: "#58a6ff",
  LBC: "#f97316",
  "Passive House": "#a855f7",
  GBS: "#ef4444",
};

export const CERT_LABELS: Record<CertType, string> = {
  LEED: "LEED",
  WELL: "WELL",
  LBC: "Living Building",
  "Passive House": "Passive House",
  GBS: "Green Building",
};

export const BIKE_INFRA_COLORS: Record<BikeInfraType, string> = {
  separated: "#16a34a",
  buffered: "#22c55e",
  lane: "#3b82f6",
  shared_path: "#8b5cf6",
  shared_lane: "#f59e0b",
  contraflow: "#06b6d4",
};

export const BIKE_INFRA_LABELS: Record<BikeInfraType, string> = {
  separated: "Separated Bike Lane",
  buffered: "Buffered Bike Lane",
  lane: "Standard Bike Lane",
  shared_path: "Shared Use Path",
  shared_lane: "Shared Lane",
  contraflow: "Contra-flow Lane",
};

export const DATA_URLS = {
  buildings:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663495221450/ifRMgFX8HpGVkitF55JDX8/buildings_55b4af38.json",
  bikeInfra:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663495221450/ifRMgFX8HpGVkitF55JDX8/bike_infra_3adaaeb0.json",
  routes:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663495221450/ifRMgFX8HpGVkitF55JDX8/routes_c225dcb9.json",
};
