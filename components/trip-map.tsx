"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap, Marker, MapLayerMouseEvent } from "maplibre-gl";

type MapSpot = {
  id: string;
  order: number;
  name: string;
  korean: string;
  lat?: number;
  lng?: number;
};

type MapRoute = {
  id: string;
  method: string;
};

type Props = {
  spots: MapSpot[];
  routes: MapRoute[];
  color: string;
  focusNonce: number;
  onSpotSelect: (spot: MapSpot) => void;
  onRouteSelect: (index: number) => void;
};

type RouteFeature = {
  type: "Feature";
  properties: { routeIndex: number; routeId: string };
  geometry: { type: "LineString"; coordinates: [number, number][] };
};

type RoutePath = RouteFeature["properties"] & { d: string };

const SEOUL: [number, number] = [126.9918, 37.5665];

function fallbackFeatures(spots: MapSpot[], routes: MapRoute[]): RouteFeature[] {
  return routes.flatMap((route, index) => {
    const from = spots[index];
    const to = spots[index + 1];
    if (!from?.lng || !from?.lat || !to?.lng || !to?.lat) return [];
    return [{
      type: "Feature",
      properties: { routeIndex: index, routeId: route.id },
      geometry: { type: "LineString", coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
    }];
  });
}

async function routedFeatures(spots: MapSpot[], routes: MapRoute[]) {
  const fallbacks = fallbackFeatures(spots, routes);
  const results = await Promise.all(fallbacks.map(async (fallback, index) => {
    const from = spots[index];
    const to = spots[index + 1];
    if (!from?.lng || !from?.lat || !to?.lng || !to?.lat) return fallback;
    const pedestrian = routes[index]?.method.includes("步行");
    const costing = pedestrian ? "pedestrian" : "auto";
    const request = { locations: [{ lat: from.lat, lon: from.lng }, { lat: to.lat, lon: to.lng }], costing, units: "kilometers" };
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6500);
    try {
      const response = await fetch(`https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(request))}`, { signal: controller.signal });
      if (!response.ok) return fallback;
      const data = await response.json() as { trip?: { legs?: Array<{ shape?: string }> } };
      const shape = data.trip?.legs?.[0]?.shape;
      if (!shape) return fallback;
      const decoded = decodePolyline(shape, 6);
      return { ...fallback, geometry: { type: "LineString" as const, coordinates: decoded } };
    } catch {
      return fallback;
    } finally {
      window.clearTimeout(timeout);
    }
  }));
  return results;
}

function decodePolyline(encoded: string, precision: number): [number, number][] {
  let index = 0; let lat = 0; let lng = 0;
  const coordinates: [number, number][] = [];
  const factor = 10 ** precision;
  while (index < encoded.length) {
    let shift = 0; let result = 0; let byte: number;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;
}

export default function TripMap({ spots, routes, color, focusNonce, onSpotSelect, onRouteSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [displayRoutes, setDisplayRoutes] = useState<RouteFeature[]>(() => fallbackFeatures(spots, routes));
  const [routePaths, setRoutePaths] = useState<RoutePath[]>([]);
  const initialSpotsRef = useRef(spots);
  const initialRoutesRef = useRef(routes);
  const spotCallbackRef = useRef(onSpotSelect);
  const routeCallbackRef = useRef(onRouteSelect);

  useEffect(() => { spotCallbackRef.current = onSpotSelect; }, [onSpotSelect]);
  useEffect(() => { routeCallbackRef.current = onRouteSelect; }, [onRouteSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
          "trip-routes": {
            type: "geojson",
            data: { type: "FeatureCollection", features: fallbackFeatures(initialSpotsRef.current, initialRoutesRef.current) },
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          { id: "trip-route-case", type: "line", source: "trip-routes", paint: { "line-color": "#ffffff", "line-width": 11, "line-opacity": .95 } },
          { id: "trip-route", type: "line", source: "trip-routes", paint: { "line-color": "#0a84ff", "line-width": 7, "line-opacity": .96 } },
        ],
      },
      center: SEOUL,
      zoom: 11.8,
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), "top-right");
    map.on("click", "trip-route", (event: MapLayerMouseEvent) => {
      const index = Number(event.features?.[0]?.properties?.routeIndex);
      if (Number.isFinite(index)) routeCallbackRef.current(index);
    });
    map.on("mouseenter", "trip-route", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "trip-route", () => { map.getCanvas().style.cursor = ""; });
    map.once("style.load", () => setMapReady(true));
    mapRef.current = map;
    return () => { markersRef.current.forEach((marker) => marker.remove()); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    const bounds = new maplibregl.LngLatBounds();
    spots.forEach((spot) => {
      if (!spot.lng || !spot.lat) return;
      const element = document.createElement("button");
      element.type = "button";
      element.className = "real-map-marker";
      element.style.setProperty("--marker-color", color);
      element.innerHTML = `<span>${spot.order}</span><b>${spot.name}</b>`;
      element.setAttribute("aria-label", `查看${spot.name}`);
      element.addEventListener("click", (event) => { event.stopPropagation(); spotCallbackRef.current(spot); });
      const marker = new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([spot.lng, spot.lat]).addTo(map);
      markersRef.current.push(marker);
      bounds.extend([spot.lng, spot.lat]);
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: { top: 90, bottom: 120, left: 70, right: 70 }, maxZoom: 14.5, duration: 700 });
    const update = async () => {
      const fallback = fallbackFeatures(spots, routes);
      const source = map.getSource("trip-routes") as GeoJSONSource | undefined;
      setDisplayRoutes(fallback);
      source?.setData({ type: "FeatureCollection", features: fallback });
      const features = await routedFeatures(spots, routes);
      setDisplayRoutes(features);
      source?.setData({ type: "FeatureCollection", features });
    };
    if (mapReady) void update();
  }, [spots, routes, color, focusNonce, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const projectRoutes = () => {
      setRoutePaths(displayRoutes.map((feature) => ({
        ...feature.properties,
        d: feature.geometry.coordinates.map(([lng, lat], index) => {
          const point = map.project([lng, lat]);
          return `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
        }).join(" "),
      })));
    };
    projectRoutes();
    map.on("move", projectRoutes);
    map.on("resize", projectRoutes);
    return () => {
      map.off("move", projectRoutes);
      map.off("resize", projectRoutes);
    };
  }, [displayRoutes, mapReady]);

  return <div className="trip-map-frame">
    <div ref={containerRef} className="real-map" aria-label="可拖动、缩放和定位的真实地图" />
    <svg className="real-route-overlay" aria-label="当天道路路线">
      {routePaths.map((route) => <g key={route.routeId}>
        <path className="real-route-case" d={route.d} />
        <path className="real-route-line" d={route.d} />
        <path className="real-route-hit" d={route.d} onClick={() => routeCallbackRef.current(route.routeIndex)}>
          <title>查看第 {route.routeIndex + 1} 段路线</title>
        </path>
      </g>)}
    </svg>
  </div>;
}
