import "leaflet";

declare module "leaflet" {
  interface MarkerClusterGroupOptions {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    disableClusteringAtZoom?: number;
    [key: string]: any;
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    clearLayers(): this;
    getVisibleParent(marker: Marker): Marker;
    refreshClusters(markers?: Marker | Marker[]): this;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
