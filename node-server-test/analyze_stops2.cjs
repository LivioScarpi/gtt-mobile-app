const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip(path.join(__dirname, 'gtt_gtfs.zip'));
const trips = parse(zip.getEntry('trips.txt').getData().toString('utf8'), { columns: true });
const stopTimes = parse(zip.getEntry('stop_times.txt').getData().toString('utf8'), { columns: true });
const rs = require(path.join(__dirname, '..', 'src/data/routes.json'));

const route10 = rs.find(r => r.shortName === '10');
const line10TripIds = new Set(trips.filter(t => t.route_id === route10.id).map(t => t.trip_id));
const tripDir = {};
const tripHS = {};
trips.filter(t => t.route_id === route10.id).forEach(t => {
  tripDir[t.trip_id] = t.direction_id;
  tripHS[t.trip_id] = t.trip_headsign;
});

// Count stops per trip
const tripStops = {};
for (const st of stopTimes) {
  if (!line10TripIds.has(st.trip_id)) continue;
  if (!tripStops[st.trip_id]) tripStops[st.trip_id] = [];
  tripStops[st.trip_id].push(st.stop_id);
}

const out = [];
for (const dir of ['0', '1']) {
  const dirTrips = Object.entries(tripStops).filter(([tid]) => tripDir[tid] === dir);
  dirTrips.sort((a, b) => b[1].length - a[1].length);
  const counts = {};
  dirTrips.forEach(([tid, stops]) => {
    const key = stops.length;
    if (!counts[key]) counts[key] = { n: 0, hs: tripHS[tid], example: tid };
    counts[key].n++;
  });
  out.push('Dir ' + dir + ':');
  Object.keys(counts).sort((a, b) => +b - +a).forEach(c => {
    out.push('  ' + c + ' stops: ' + counts[c].n + ' trips, headsign="' + counts[c].hs + '", example=' + counts[c].example);
  });
  out.push('  Best trip stops: ' + dirTrips[0][1].join(','));
}
fs.writeFileSync('/tmp/stops_analysis.txt', out.join('\n'));
