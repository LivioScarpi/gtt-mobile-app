import { decodeFeedMessage } from './gtfsrt';

// Import pre-processed GTFS static data
import stopsData from '../data/stops.json';
import routesData from '../data/routes.json';
import stopRoutesData from '../data/stopRoutes.json';
import routeStopsData from '../data/routeStops.json';
import tripToRouteData from '../data/tripToRoute.json';
import routeIdMapData from '../data/routeIdMap.json';
import lineShapesData from '../data/lineShapes.json';
import tripToPatternData from '../data/tripToPattern.json';
import patternStopsData from '../data/patternStops.json';
import routeDirectionsData from '../data/routeDirections.json';

// ── Types ──────────────────────────────────────────────
export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface Route {
  id: string;
  shortName: string;
  longName: string;
  type: number; // 0=tram, 1=metro, 3=bus
  color: string | null;
}

export interface Arrival {
  tripId: string;
  line: string;
  scheduledTime: string;
  realtimeTime: string;
  delayMin: number;
  isRealtime: boolean;
  etaMin: number;
  vehicleId: string | null;
}

export interface Vehicle {
  vehicleId: string;
  tripId: string;
  routeId: string;
  line: string;
  lat: number;
  lon: number;
  bearing: number | null;
  speedKmh: number | null;
  timestamp: number;
}

export interface DirectionInfo {
  dir: number;
  headsign: string;
}

// ── GTT GTFS-RT feed URLs ──────────────────────────────
const GTT_TRIPS_URL = 'https://percorsieorari.gtt.to.it/das_gtfsrt/trip_update.aspx';
const GTT_VEHICLES_URL = 'https://percorsieorari.gtt.to.it/das_gtfsrt/vehicle_position.aspx';

// ── Typed static data ──────────────────────────────────
const stops: Stop[] = stopsData as Stop[];
const routes: Route[] = routesData as Route[];
const stopRoutes: Record<string, string[]> = stopRoutesData as Record<string, string[]>;
const routeStops: Record<string, string[]> = routeStopsData as Record<string, string[]>;
const tripToRoute: Record<string, string> = tripToRouteData as Record<string, string>;
const routeIdMap: Record<string, string> = routeIdMapData as Record<string, string>;
const lineShapes = lineShapesData as Record<string, number[][]>;
const tripToPattern: Record<string, number> = tripToPatternData as Record<string, number>;
const patternStops: Record<string, string[]> = patternStopsData as Record<string, string[]>;
const routeDirections: Record<string, DirectionInfo[]> = routeDirectionsData as Record<string, DirectionInfo[]>;

/** For a given tripId, find which 1-based stopSequence corresponds to stopId */
function getStopSequenceForTrip(tripId: string, stopId: string): number | null {
  const patternId = tripToPattern[tripId];
  if (patternId == null) return null;
  const stops = patternStops[patternId];
  if (!stops) return null;
  const idx = stops.indexOf(stopId);
  return idx >= 0 ? idx + 1 : null; // 1-based
}

// Build lookup maps
const stopsById: Record<string, Stop> = {};
stops.forEach(s => { stopsById[s.id] = s; });

// ── Helper: haversine distance (km) ─────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r;
  const dLon = (lon2 - lon1) * d2r;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Helper: fetch + decode GTFS-RT feed ──────────────────
async function fetchFeed(url: string): Promise<any> {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'GTT-Mobile/1.0' },
  });
  const buffer = await resp.arrayBuffer();
  return decodeFeedMessage(new Uint8Array(buffer));
}

// ── Public API ──────────────────────────────────────────

/** All stops */
export function getAllStops(): Stop[] {
  return stops;
}

/** Get stop by ID */
export function getStop(stopId: string): Stop | undefined {
  return stopsById[stopId];
}

/** Search stops by name — matches if every query word appears in the stop name */
export function searchStops(query: string, limit = 20): Stop[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return [];
  return stops
    .filter(s => {
      const name = s.name.toLowerCase();
      return words.every(w => name.includes(w));
    })
    .slice(0, limit);
}

/** Nearby stops by coordinates */
export function getNearbyStops(lat: number, lon: number, radiusKm = 0.5): (Stop & { distanceM: number })[] {
  return stops
    .map(s => ({ ...s, distanceM: Math.round(haversine(lat, lon, s.lat, s.lon) * 1000) }))
    .filter(s => s.distanceM <= radiusKm * 1000)
    .sort((a, b) => a.distanceM - b.distanceM);
}

/** All routes/lines */
export function getAllRoutes(): Route[] {
  return routes;
}

/** Get route type label */
export function getRouteTypeLabel(type: number): string {
  switch (type) {
    case 0: return 'Tram';
    case 1: return 'Metro';
    case 3: return 'Bus';
    default: return 'Altro';
  }
}

/** Get route type icon */
export function getRouteTypeIcon(type: number): string {
  switch (type) {
    case 0: return 'tram';
    case 1: return 'train.side.front.car';
    case 3: return 'bus';
    default: return 'bus';
  }
}

/** Lines passing through a stop */
export function getLinesForStop(stopId: string): string[] {
  return stopRoutes[stopId] ?? [];
}

/** Stops on a line (optionally filtered by direction) */
export function getStopsForLine(lineShortName: string, direction?: number): Stop[] {
  const key = direction != null ? `${lineShortName}_${direction}` : lineShortName;
  let stopIds = routeStops[key];
  // Fallback: if no direction-specific key, try both directions merged
  if (!stopIds && direction == null) {
    const d0 = routeStops[`${lineShortName}_0`] ?? [];
    const d1 = routeStops[`${lineShortName}_1`] ?? [];
    const seen = new Set<string>();
    stopIds = [];
    for (const id of [...d0, ...d1]) {
      if (!seen.has(id)) { seen.add(id); stopIds.push(id); }
    }
  }
  if (!stopIds) return [];
  return stopIds.map(id => stopsById[id]).filter(Boolean);
}

/** Route shape polyline for a line (optionally filtered by direction) */
export function getShapeForLine(lineShortName: string, direction?: number): { latitude: number; longitude: number }[] {
  const key = direction != null ? `${lineShortName}_${direction}` : lineShortName;
  let pts = lineShapes[key];
  // Fallback: try direction 0
  if (!pts && direction == null) {
    pts = lineShapes[`${lineShortName}_0`];
  }
  if (!pts) return [];
  return pts.map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
}

/** Get directions for a line */
export function getDirectionsForLine(lineShortName: string): DirectionInfo[] {
  return routeDirections[lineShortName] ?? [];
}

/** Fetch real-time arrivals for a stop */
export async function getArrivals(stopId: string, lineFilter?: string): Promise<Arrival[]> {
  const feed = await fetchFeed(GTT_TRIPS_URL);
  const arrivals: Arrival[] = [];

  for (const entity of feed.entity) {
    const tu = entity.tripUpdate;
    if (!tu?.trip?.tripId) continue;

    const tripId = tu.trip.tripId;
    const line = tripToRoute[tripId];
    if (!line) continue;
    if (lineFilter && line !== lineFilter) continue;

    // Find which stopSequence corresponds to our stopId for this trip
    const targetSeq = getStopSequenceForTrip(tripId, stopId);
    if (targetSeq == null) continue;

    // Find the matching stopTimeUpdate by stopSequence
    const stopUpdate = tu.stopTimeUpdate?.find(
      (s: any) => s.stopSequence === targetSeq
    );

    // Even if there's no RT update for this specific stop,
    // we know the trip passes through it. Use nearest stop update for delay estimate.
    let delayS = 0;
    if (stopUpdate?.arrival) {
      delayS = stopUpdate.arrival.delay ?? 0;
    } else if (tu.stopTimeUpdate?.length > 0) {
      // Use delay from nearest available stopSequence as estimate
      let closest = tu.stopTimeUpdate[0];
      let minDist = Math.abs((closest.stopSequence ?? 0) - targetSeq);
      for (const su of tu.stopTimeUpdate) {
        const d = Math.abs((su.stopSequence ?? 0) - targetSeq);
        if (d < minDist) { minDist = d; closest = su; }
      }
      delayS = closest.arrival?.delay ?? 0;
    }

    // Compute ETA: we don't have scheduled arrival times in the RT feed,
    // but we can estimate from the delay + the last known RT sequence
    // For now, use a simple heuristic based on delay
    const lastSeqInFeed = tu.stopTimeUpdate?.length > 0
      ? Math.max(...tu.stopTimeUpdate.map((s: any) => s.stopSequence ?? 0))
      : 0;
    const firstSeqInFeed = tu.stopTimeUpdate?.length > 0
      ? Math.min(...tu.stopTimeUpdate.map((s: any) => s.stopSequence ?? 0))
      : 0;

    // Skip trips where the vehicle has already passed our stop
    if (firstSeqInFeed > targetSeq) continue;

    // Estimate ETA: if we have an arrival time, use it; otherwise estimate from delay
    const arrivalTime = stopUpdate?.arrival?.time;
    let etaMin: number;
    let realtimeTime: string;
    let scheduledTime = '--:--';

    if (arrivalTime && arrivalTime > 0) {
      const rt = new Date(arrivalTime * 1000);
      realtimeTime = `${String(rt.getHours()).padStart(2, '0')}:${String(rt.getMinutes()).padStart(2, '0')}`;
      etaMin = Math.round((rt.getTime() - Date.now()) / 60000);
      const st = new Date((arrivalTime - delayS) * 1000);
      scheduledTime = `${String(st.getHours()).padStart(2, '0')}:${String(st.getMinutes()).padStart(2, '0')}`;
    } else {
      // No absolute time — estimate based on delay
      // The vehicle is somewhere before targetSeq, with delayS seconds of delay
      // We can't know exact scheduled time without stop_times, so mark as "in viaggio"
      const stopsAway = targetSeq - (firstSeqInFeed || 1);
      etaMin = Math.max(0, Math.round(stopsAway * 1.5 + delayS / 60)); // ~1.5 min per stop estimate
      const etaDate = new Date(Date.now() + etaMin * 60000);
      realtimeTime = `~${String(etaDate.getHours()).padStart(2, '0')}:${String(etaDate.getMinutes()).padStart(2, '0')}`;
    }

    if (etaMin < -2) continue; // already passed

    arrivals.push({
      tripId,
      line,
      scheduledTime,
      realtimeTime,
      delayMin: Math.round(delayS / 60),
      isRealtime: !!stopUpdate?.arrival,
      etaMin,
      vehicleId: tu.vehicle?.id ?? null,
    });
  }

  arrivals.sort((a, b) => a.etaMin - b.etaMin);
  return arrivals.slice(0, 10);
}

/** Fetch all vehicle positions, optionally filtered by line */
export async function getVehicles(lineFilter?: string): Promise<Vehicle[]> {
  const feed = await fetchFeed(GTT_VEHICLES_URL);
  const vehicles: Vehicle[] = [];

  for (const entity of feed.entity) {
    const v = entity.vehicle;
    if (!v?.position) continue;

    const tripId = v.trip?.tripId ?? '';
    const routeId = v.trip?.routeId ?? '';
    const line = tripToRoute[tripId] ?? routeIdMap[routeId] ?? '';

    if (lineFilter && line !== lineFilter) continue;

    vehicles.push({
      vehicleId: v.vehicle?.id ?? entity.id,
      tripId,
      routeId,
      line,
      lat: v.position.latitude,
      lon: v.position.longitude,
      bearing: v.position.bearing ?? null,
      speedKmh: v.position.speed ? Math.round(v.position.speed * 3.6) : null,
      timestamp: Number(v.timestamp ?? 0),
    });
  }

  return vehicles;
}
