const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip(path.join(__dirname, 'gtt_gtfs.zip'));
const trips = parse(zip.getEntry('trips.txt').getData().toString('utf8'), { columns: true });
const stopTimes = parse(zip.getEntry('stop_times.txt').getData().toString('utf8'), { columns: true });
const rs = require(path.join(__dirname, '..', 'src/data/routes.json'));

const out = [];

const route10 = rs.find(r => r.shortName === '10');
const tripToDir = {};
const tripToHeadsign = {};
trips.forEach(t => {
  tripToDir[t.trip_id] = t.direction_id;
  tripToHeadsign[t.trip_id] = t.trip_headsign;
});

// Count stops per trip for line 10
const tripStopCounts = {};
for (const st of stopTimes) {
  const t = trips.find(tr => tr.trip_id === st.trip_id && tr.route_id === route10.id);
  if (!t) continue;
  if (!tripStopCounts[st.trip_id]) tripStopCounts[st.trip_id] = { dir: t.direction_id, headsign: t.trip_headsign, count: 0 };
  tripStopCounts[st.trip_id].count++;
}

// Group by direction
const byDir = { '0': [], '1': [] };
for (const [tripId, info] of Object.entries(tripStopCounts)) {
  byDir[info.dir].push({ tripId, ...info });
}

for (const dir of ['0', '1']) {
  const sorted = byDir[dir].sort((a, b) => b.count - a.count);
  out.push(`Dir ${dir}:`);
  // Show unique stop counts
  const counts = [...new Set(sorted.map(t => t.count))].sort((a, b) => b - a);
  for (const c of counts) {
    const matching = sorted.filter(t => t.count === c);
    out.push(`  ${c} stops: ${matching.length} trips (headsign: "${matching[0].headsign}")`);
  }
  out.push(`  Max trip: ${sorted[0].tripId} with ${sorted[0].count} stops`);
}

fs.writeFileSync(path.join(__dirname, 'stops_analysis.txt'), out.join('\n'));
