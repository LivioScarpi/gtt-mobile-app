import express from 'express'
import fetch from 'node-fetch'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import AdmZip from 'adm-zip'
import { parse } from 'csv-parse/sync'

const app = express()
const GTT_TRIPS_URL    = 'http://percorsieorari.gtt.to.it/das_gtfsrt/trip_update.aspx'
const GTT_VEHICLES_URL = 'http://percorsieorari.gtt.to.it/das_gtfsrt/vehicle_position.aspx'

// ── Carica GTFS statico in memoria ──────────────
let tripToRoute    = {}  // tripId  → routeShortName (es. "10")
let tripToStopSeqs = {}  // tripId  → { stopSequence → { stopId, arrival_time } }

function loadGtfs() {
  console.log('Caricamento GTFS statico...')
  const zip = new AdmZip('./gtt_gtfs.zip')

  // routes.txt → routeId → route_short_name
  const routes = {}
  parse(zip.getEntry('routes.txt').getData().toString('utf8'), { columns: true })
    .forEach(r => routes[r.route_id] = r.route_short_name)

  // trips.txt → tripId → routeShortName
  parse(zip.getEntry('trips.txt').getData().toString('utf8'), { columns: true })
    .forEach(r => tripToRoute[r.trip_id] = routes[r.route_id] ?? r.route_id)

  // stop_times.txt → tripId → { stopSequence → { stopId, arrival_time } }
  parse(zip.getEntry('stop_times.txt').getData().toString('utf8'), { columns: true })
    .forEach(r => {
      if (!tripToStopSeqs[r.trip_id]) tripToStopSeqs[r.trip_id] = {}
      tripToStopSeqs[r.trip_id][+r.stop_sequence] = {
        stopId:       r.stop_id,
        arrival_time: r.arrival_time
      }
    })

  const tripCount = Object.keys(tripToRoute).length
  console.log(`✅ GTFS caricato: ${tripCount} trip`)
}

loadGtfs()

// ── Helper: fetch feed RT ────────────────────────
async function fetchFeed(url) {
  const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const buffer = await resp.arrayBuffer()
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))
}

// ── Helper: haversine (distanza in km) ──────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, d2r = Math.PI / 180
  const dLat = (lat2 - lat1) * d2r
  const dLon = (lon2 - lon1) * d2r
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*d2r) * Math.cos(lat2*d2r) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ── GET /next/:stopId/:routeId ───────────────────
// Esempio: /next/381/10
app.get('/next/:stopId/:routeId', async (req, res) => {
  const { stopId, routeId } = req.params
  const limit = +(req.query.limit ?? 3)

  try {
    const feed = await fetchFeed(GTT_TRIPS_URL)

    // Trova i trip RT che:
    // 1. Appartengono alla linea giusta (via GTFS statico)
    // 2. Passano per la fermata giusta (via stopSequence → stopId)
    const matches = []

    for (const entity of feed.entity) {
      const tu = entity.tripUpdate
      if (!tu) continue

      const tid = tu.trip.tripId

      // Controlla linea
      if (tripToRoute[tid] !== routeId) continue

      // Trova la fermata cercata dentro i stop_times statici di questo trip
      const stopSeqs = tripToStopSeqs[tid]
      if (!stopSeqs) continue

      const seqEntry = Object.entries(stopSeqs).find(([, v]) => v.stopId === stopId)
      if (!seqEntry) continue

      const [seq, staticStop] = seqEntry

      // Cerca ritardo RT per questa stopSequence
      const rtStop = tu.stopTimeUpdate?.find(s => s.stopSequence === +seq)
      const delayS = rtStop?.arrival?.delay ?? 0

      // Calcola orario reale
      const [h, m, s] = staticStop.arrival_time.split(':').map(Number)
      const scheduled = new Date()
      scheduled.setHours(h, m, s, 0)
      const realtime = new Date(scheduled.getTime() + delayS * 1000)
      const etaMin = Math.round((realtime - Date.now()) / 60000)

      if (etaMin < -2) continue  // già passato

      matches.push({
        tripId:         tid,
        vehicleId:      tu.vehicle?.id ?? null,
        scheduled_time: staticStop.arrival_time,
        realtime_time:  `${String(realtime.getHours()).padStart(2,'0')}:${String(realtime.getMinutes()).padStart(2,'0')}`,
        delay_s:        delayS,
        delay_min:      Math.round(delayS / 60),
        eta_min:        etaMin,
        realtime:       !!rtStop
      })
    }

    // Ordina per orario di arrivo reale
    matches.sort((a, b) => a.eta_min - b.eta_min)
    const next = matches.slice(0, limit)

    if (!next.length)
      return res.json({ error: `Nessun passaggio trovato per linea ${routeId} alla fermata ${stopId}` })

    // Arricchisce il primo bus con posizione GPS
    try {
      const vFeed = await fetchFeed(GTT_VEHICLES_URL)
      for (const trip of next) {
        const v = vFeed.entity.find(e => e.vehicle?.vehicle?.id === trip.vehicleId)?.vehicle
        if (v?.position) {
          trip.vehicle_position = {
            lat:        v.position.latitude,
            lon:        v.position.longitude,
            bearing:    v.position.bearing ?? null,
            speed_kmh:  v.position.speed ? Math.round(v.position.speed * 3.6) : null,
          }
        }
      }
    } catch (_) { /* vehicles feed opzionale */ }

    res.json({ stopId, routeId, updated_at: new Date().toISOString(), next })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /debug/raw ───────────────────────────────
app.get('/debug/raw', async (req, res) => {
  const feed = await fetchFeed(GTT_TRIPS_URL)
  res.json(feed.entity.slice(0, 3).map(e => JSON.parse(JSON.stringify(e))))
});

// ── GET /debug/trips ─────────────────────────────
// Mostra i primi trip con join GTFS statico già risolto
app.get('/debug/trips', async (req, res) => {
  const feed = await fetchFeed(GTT_TRIPS_URL)
  const sample = feed.entity.slice(0, 20).map(e => {
    const tid = e.tripUpdate?.trip?.tripId
    return {
      tripId:  tid,
      linea:   tripToRoute[tid] ?? '?',
      fermate: Object.values(tripToStopSeqs[tid] ?? {}).slice(0, 3).map(s => s.stopId)
    }
  })
  res.json({ total: feed.entity.length, sample })
});

// ── GET /debug/stop ─────────────────────────────
app.get('/debug/stop/:stopId', async (req, res) => {
  const { stopId } = req.params

  // Trova tutti i trip che passano per questa fermata
  const trips = []
  for (const [tripId, seqs] of Object.entries(tripToStopSeqs)) {
    const found = Object.values(seqs).find(s => s.stopId === stopId)
    if (found) {
      trips.push({
        tripId,
        linea: tripToRoute[tripId] ?? '?',
        arrival_time: found.arrival_time
      })
    }
  }

  // Raggruppa per linea
  const byLine = {}
  for (const t of trips) {
    if (!byLine[t.linea]) byLine[t.linea] = 0
    byLine[t.linea]++
  }

  res.json({
    stopId,
    total_trips: trips.length,
    linee_che_passano: byLine,
    sample: trips.slice(0, 5)
  })
});

// ── GET /debug/line ─────────────────────────────
app.get('/debug/line/:routeId', async (req, res) => {
  const { routeId } = req.params

  // Trova tutte le fermate dove passa questa linea
  const stops = new Set()
  for (const [tripId, seqs] of Object.entries(tripToStopSeqs)) {
    if (tripToRoute[tripId] !== routeId) continue
    Object.values(seqs).forEach(s => stops.add(s.stopId))
  }

  res.json({
    routeId,
    total_stops: stops.size,
    stop_ids: [...stops].slice(0, 30)
  })
});

// ── GET /debug/findstop ─────────────────────────────
app.get('/debug/findstop/:name', async (req, res) => {
  const { name } = req.params

  // Leggi stops.txt dallo zip
  const zip = new AdmZip('./gtt_gtfs.zip')
  const stops = parse(zip.getEntry('stops.txt').getData().toString('utf8'), { columns: true })

  // Cerca per nome
  const found = stops.filter(s => 
    s.stop_name?.toLowerCase().includes(name.toLowerCase())
  ).map(s => ({ stop_id: s.stop_id, stop_name: s.stop_name, lat: s.stop_lat, lon: s.stop_lon }))

  res.json({ count: found.length, stops: found })
});

// ── GET /track ─────────────────────────────
// GET /track/:tripId
// Posizione stimata del veicolo basata su stopSequence + orari GTFS statico
app.get('/track/:tripId', async (req, res) => {
  const { tripId } = req.params

  try {
    // 1. Prendi trip updates per sapere a che punto è il bus
    const tripsResp = await fetch(GTT_TRIPS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const tripsBuffer = await tripsResp.arrayBuffer()
    const tripsFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(tripsBuffer))

    const entity = tripsFeed.entity.find(e => e.tripUpdate?.trip?.tripId === tripId)
    if (!entity) return res.status(404).json({ error: 'Trip non trovato nel feed' })

    const tu = entity.tripUpdate
    const vehicleId = tu.vehicle?.id ?? null

    // 2. Ultima stopSequence nota dal feed RT
    const updates = tu.stopTimeUpdate ?? []
    const lastUpdate = updates[updates.length - 1]
    const currentSeq = lastUpdate?.stopSequence ?? null
    const delayS = lastUpdate?.arrival?.delay ?? 0

    // 3. Recupera le fermate del trip dal GTFS statico
    const stopSeqs = tripToStopSeqs[tripId]
    if (!stopSeqs) return res.status(404).json({ error: 'Trip non trovato nel GTFS statico' })

    // Ordina le fermate per sequenza
    const sortedStops = Object.entries(stopSeqs)
      .map(([seq, s]) => ({ seq: +seq, stopId: s.stopId, arrival_time: s.arrival_time }))
      .sort((a, b) => a.seq - b.seq)

    // 4. Leggi le coordinate delle fermate da stops.txt
    const zip = new AdmZip('./gtt_gtfs.zip')
    const stopsRows = parse(zip.getEntry('stops.txt').getData().toString('utf8'), { columns: true })
    const stopsMap = {}
    stopsRows.forEach(s => stopsMap[s.stop_id] = { lat: +s.stop_lat, lon: +s.stop_lon, name: s.stop_name })

    // 5. Trova fermata corrente e prossima
    const currentIdx = currentSeq
      ? sortedStops.findIndex(s => s.seq === currentSeq)
      : 0
    const currentStop = sortedStops[currentIdx]
    const nextStop = sortedStops[currentIdx + 1] ?? null

    const currentCoords = currentStop ? stopsMap[currentStop.stopId] : null
    const nextCoords = nextStop ? stopsMap[nextStop.stopId] : null

    // 6. Interpola posizione tra fermata corrente e prossima in base all'orario
    let estimatedLat = currentCoords?.lat ?? null
    let estimatedLon = currentCoords?.lon ?? null

    if (currentCoords && nextCoords && currentStop && nextStop) {
      const parseTime = (t) => {
        const [h, m, s] = t.split(':').map(Number)
        const d = new Date()
        d.setHours(h, m, s, 0)
        return d.getTime()
      }
      const now = Date.now() + delayS * 1000
      const tCurrent = parseTime(currentStop.arrival_time)
      const tNext = parseTime(nextStop.arrival_time)
      const progress = Math.min(1, Math.max(0, (now - tCurrent) / (tNext - tCurrent)))

      // Interpolazione lineare tra le due fermate
      estimatedLat = currentCoords.lat + (nextCoords.lat - currentCoords.lat) * progress
      estimatedLon = currentCoords.lon + (nextCoords.lon - currentCoords.lon) * progress
    }

    res.json({
      tripId,
      vehicleId,
      position_type:   'estimated',  // 'gps' se fosse dal feed veicoli, 'estimated' se interpolato
      lat:             estimatedLat,
      lon:             estimatedLon,
      delay_s:         delayS,
      delay_min:       Math.round(delayS / 60),
      current_stop: currentStop ? {
        stopId:       currentStop.stopId,
        name:         stopsMap[currentStop.stopId]?.name,
        arrival_time: currentStop.arrival_time,
        seq:          currentStop.seq
      } : null,
      next_stop: nextStop ? {
        stopId:       nextStop.stopId,
        name:         stopsMap[nextStop.stopId]?.name,
        arrival_time: nextStop.arrival_time,
        seq:          nextStop.seq
      } : null,
      updated_at: new Date().toISOString()
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});

// ── GET /debug/vehicles ─────────────────────────────
// Mostra i primi veicoli del feed posizioni — per vedere la struttura reale
app.get('/debug/vehicles', async (req, res) => {
  const resp = await fetch(GTT_VEHICLES_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const buffer = await resp.arrayBuffer()
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))

  const sample = feed.entity.slice(0, 5).map(e => JSON.parse(JSON.stringify(e)))
  res.json({ total: feed.entity.length, sample })
})

app.listen(3000, () => console.log('✅ http://localhost:3000'))