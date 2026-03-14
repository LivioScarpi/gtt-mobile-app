const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip('./gtt_gtfs.zip');
const outDir = '/Users/livioscarpinati/Desktop/gtt-mobile-app/src/data';
fs.mkdirSync(outDir, { recursive: true });

// 1. Extract stops
const stopsRaw = parse(zip.getEntry('stops.txt').getData().toString('utf8'), { columns: true });
const stops = stopsRaw
  .filter(s => s.stop_lat && s.stop_lon && +s.stop_lat !== 0)
  .map(s => ({ id: s.stop_id, name: s.stop_name, lat: +s.stop_lat, lon: +s.stop_lon }));
console.log('Stops:', stops.length);

// 2. Extract routes  
const routesRaw = parse(zip.getEntry('routes.txt').getData().toString('utf8'), { columns: true });
const routes = routesRaw.map(r => ({
  id: r.route_id,
  shortName: r.route_short_name,
  longName: r.route_long_name,
  type: +r.route_type,
  color: r.route_color || null
}));
console.log('Routes:', routes.length);

// Filter to urban lines only (type 0 = tram, 3 = bus, 1 = metro)
const urbanRoutes = routes.filter(r => [0, 1, 3].includes(r.type));
console.log('Urban routes:', urbanRoutes.length);

// 3. Build route lookups
const routeIdToShortName = {};
routes.forEach(r => { routeIdToShortName[r.id] = r.shortName; });

// 4. Extract trips → build tripId → routeId mapping
const tripsRaw = parse(zip.getEntry('trips.txt').getData().toString('utf8'), { columns: true });
console.log('Trips:', tripsRaw.length);

const tripToRouteId = {};
const tripToDir = {};
tripsRaw.forEach(t => {
  tripToRouteId[t.trip_id] = t.route_id;
  tripToDir[t.trip_id] = t.direction_id;
});

// 5. Process stop_times to build:
//    - stopRoutes: stopId → Set of routeShortName
//    - routeStops: routeShortName_dir → ordered list of stops (from first trip per route+dir)
console.log('Processing stop_times (this may take a moment)...');
const stopTimesRaw = parse(zip.getEntry('stop_times.txt').getData().toString('utf8'), { columns: true });
console.log('Stop times:', stopTimesRaw.length);

const stopRoutes = {}; // stopId → Set<routeShortName>
const tripStops = {}; // "tripId" → [{seq, stopId}]
const tripMeta = {};  // "tripId" → { dir, routeId }

for (const st of stopTimesRaw) {
  const routeId = tripToRouteId[st.trip_id];
  if (!routeId) continue;
  const shortName = routeIdToShortName[routeId];
  if (!shortName) continue;
  const dir = tripToDir[st.trip_id];

  // stopRoutes
  if (!stopRoutes[st.stop_id]) stopRoutes[st.stop_id] = new Set();
  stopRoutes[st.stop_id].add(shortName);

  // Collect all stops per trip
  if (!tripStops[st.trip_id]) {
    tripStops[st.trip_id] = [];
    tripMeta[st.trip_id] = { dir, routeId };
  }
  tripStops[st.trip_id].push({ seq: +st.stop_sequence, stopId: st.stop_id });
}

// Pick the trip with the most stops per route+direction
const routeStopsMap = {};
for (const [tripId, stops] of Object.entries(tripStops)) {
  const { dir, routeId } = tripMeta[tripId];
  const rdKey = `${routeId}_${dir}`;
  if (!routeStopsMap[rdKey] || stops.length > routeStopsMap[rdKey].stops.length) {
    routeStopsMap[rdKey] = { dir, routeId, stops };
  }
}

// Convert stopRoutes sets to arrays
const stopRoutesObj = {};
for (const [stopId, routeSet] of Object.entries(stopRoutes)) {
  stopRoutesObj[stopId] = [...routeSet].sort((a, b) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
}

// Convert routeStops to sorted arrays keyed by "shortName_dir"
const routeStopsObj = {};
for (const [rdKey, data] of Object.entries(routeStopsMap)) {
  const shortName = routeIdToShortName[data.routeId];
  const key = `${shortName}_${data.dir}`;
  routeStopsObj[key] = data.stops
    .sort((a, b) => a.seq - b.seq)
    .map(s => s.stopId);
}

// 5b. Build routeDirections: shortName → [{dir, headsign}]
const routeDirections = {};
tripsRaw.forEach(t => {
  const shortName = routeIdToShortName[t.route_id];
  if (!shortName) return;
  if (!routeDirections[shortName]) routeDirections[shortName] = {};
  const dir = t.direction_id;
  if (!routeDirections[shortName][dir]) {
    routeDirections[shortName][dir] = t.trip_headsign || '';
  }
});
// Convert to array format
const routeDirectionsArr = {};
for (const [shortName, dirs] of Object.entries(routeDirections)) {
  routeDirectionsArr[shortName] = Object.entries(dirs)
    .sort((a, b) => +a[0] - +b[0])
    .map(([dir, headsign]) => ({ dir: +dir, headsign }));
}

// 6. Build tripToRoute mapping (tripId → routeShortName) needed for RT feed
const tripToRoute = {};
tripsRaw.forEach(t => {
  const shortName = routeIdToShortName[t.route_id];
  if (shortName) tripToRoute[t.trip_id] = shortName;
});

// 6b. Extract shapes and build lineShapes keyed by "shortName_dir"
console.log('Processing shapes...');
const shapesRaw = parse(zip.getEntry('shapes.txt').getData().toString('utf8'), { columns: true });
console.log('Shape points:', shapesRaw.length);

// Build shape_id → sorted point array
const shapePoints = {};
for (const sp of shapesRaw) {
  if (!shapePoints[sp.shape_id]) shapePoints[sp.shape_id] = [];
  shapePoints[sp.shape_id].push({ seq: +sp.shape_pt_sequence, lat: +sp.shape_pt_lat, lon: +sp.shape_pt_lon });
}
for (const pts of Object.values(shapePoints)) {
  pts.sort((a, b) => a.seq - b.seq);
}

// For each route+direction, pick the shape with the most points
const bestShape = {};
tripsRaw.forEach(t => {
  const shortName = routeIdToShortName[t.route_id];
  if (!shortName || !t.shape_id) return;
  const key = `${shortName}_${t.direction_id}`;
  const pts = shapePoints[t.shape_id];
  if (!pts) return;
  if (!bestShape[key] || pts.length > bestShape[key].length) {
    bestShape[key] = pts;
  }
});

// Convert to [lat, lon] arrays
const lineShapesObj = {};
for (const [key, pts] of Object.entries(bestShape)) {
  lineShapesObj[key] = pts.map(p => [p.lat, p.lon]);
}

// 7. Write output files
fs.writeFileSync(path.join(outDir, 'stops.json'), JSON.stringify(stops));
console.log('Written stops.json:', (fs.statSync(path.join(outDir, 'stops.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify(urbanRoutes));
console.log('Written routes.json:', (fs.statSync(path.join(outDir, 'routes.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'stopRoutes.json'), JSON.stringify(stopRoutesObj));
console.log('Written stopRoutes.json:', (fs.statSync(path.join(outDir, 'stopRoutes.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'routeStops.json'), JSON.stringify(routeStopsObj));
console.log('Written routeStops.json:', (fs.statSync(path.join(outDir, 'routeStops.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'tripToRoute.json'), JSON.stringify(tripToRoute));
console.log('Written tripToRoute.json:', (fs.statSync(path.join(outDir, 'tripToRoute.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'routeIdMap.json'), JSON.stringify(routeIdToShortName));
console.log('Written routeIdMap.json:', (fs.statSync(path.join(outDir, 'routeIdMap.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'lineShapes.json'), JSON.stringify(lineShapesObj));
console.log('Written lineShapes.json:', (fs.statSync(path.join(outDir, 'lineShapes.json')).size / 1024).toFixed(1), 'KB');

fs.writeFileSync(path.join(outDir, 'routeDirections.json'), JSON.stringify(routeDirectionsArr));
console.log('Written routeDirections.json:', (fs.statSync(path.join(outDir, 'routeDirections.json')).size / 1024).toFixed(1), 'KB');

console.log('\nDone! All files written to', outDir);
