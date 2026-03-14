# GTT App — Documentazione API

URL base: `http://localhost:3000`

---

## Endpoint disponibili

### Fermate

---

#### `GET /stops/:stopId`
Dettaglio di una fermata.

```bash
curl http://localhost:3000/stops/1533
```

```json
{
  "stop_id": "1533",
  "stop_name": "Porta Nuova",
  "stop_lat": 45.0631,
  "stop_lon": 7.6782,
  "wheelchair_boarding": 1
}
```

---

#### `GET /stops/nearby?lat=&lon=&radius=`
Fermate vicine a una coordinata (raggio in metri, default 500).

```bash
curl "http://localhost:3000/stops/nearby?lat=45.0677&lon=7.6826&radius=300"
```

```json
[
  { "stop_id": "1533", "stop_name": "Porta Nuova", "stop_lat": 45.063, "stop_lon": 7.678, "distance_m": 145 },
  { "stop_id": "1540", "stop_name": "Carlo Felice",  "stop_lat": 45.066, "stop_lon": 7.680, "distance_m": 287 }
]
```

---

#### `GET /stops/search?q=`
Ricerca fermata per nome.

```bash
curl "http://localhost:3000/stops/search?q=Lingotto"
```

```json
[
  { "stop_id": "2210", "stop_name": "Lingotto FS", "stop_lat": 44.992, "stop_lon": 7.673 },
  { "stop_id": "2211", "stop_name": "Lingotto Fiere",  "stop_lat": 44.990, "stop_lon": 7.671 }
]
```

---

### Arrivi in tempo reale

---

#### `GET /arrivals/:stopId`
Prossimi arrivi per una fermata — orari programmati + ritardi GTFS-RT.

```bash
curl http://localhost:3000/arrivals/1533
curl "http://localhost:3000/arrivals/1533?limit=5"
```

```json
{
  "stop_id": "1533",
  "updated_at": "2026-03-07T10:22:01.000Z",
  "arrivals": [
    {
      "trip_id": "GTT_T4_001",
      "line": "4",
      "headsign": "Falchera",
      "route_color": "#E2001A",
      "scheduled_time": "10:24:00",
      "realtime_time": "10:26",
      "delay_min": 2,
      "realtime": true
    },
    {
      "trip_id": "GTT_B18_042",
      "line": "18",
      "headsign": "Piazza Bengasi",
      "route_color": null,
      "scheduled_time": "10:27:00",
      "realtime_time": "10:27",
      "delay_min": 0,
      "realtime": false
    }
  ]
}
```

---

### Posizioni veicoli (mappa live)

---

#### `GET /vehicles`
Tutti i mezzi GTT in circolazione in questo momento.

```bash
curl http://localhost:3000/vehicles
curl "http://localhost:3000/vehicles?route=4"
```

```json
{
  "count": 312,
  "updated_at": "2026-03-07T10:22:05.000Z",
  "vehicles": [
    {
      "vehicle_id": "GTT_1042",
      "trip_id": "GTT_T4_001",
      "route_id": "T4",
      "line": "4",
      "lat": 45.0661,
      "lon": 7.6835,
      "bearing": 180,
      "speed_kmh": 22,
      "updated_at": "2026-03-07T10:22:00.000Z"
    }
  ]
}
```

---

#### `GET /vehicles/:vehicleId`
Posizione di un singolo veicolo.

```bash
curl http://localhost:3000/vehicles/GTT_1042
```

---

### Avvisi di servizio

---

#### `GET /alerts`
Avvisi attivi (interruzioni, deviazioni, scioperi).

```bash
curl http://localhost:3000/alerts
curl "http://localhost:3000/alerts?route=15"
```

```json
{
  "count": 1,
  "updated_at": "2026-03-07T10:22:10.000Z",
  "alerts": [
    {
      "alert_id": "alert_001",
      "effect": "DETOUR",
      "cause": "CONSTRUCTION",
      "header": "Linea 15 — deviazione percorso",
      "description": "Dal 7 al 14 marzo la linea 15 è deviata in via Roma per lavori in corso su corso Vittorio.",
      "routes": ["B15"],
      "stops": ["1100", "1101"],
      "active_from": "2026-03-07T00:00:00.000Z",
      "active_to": "2026-03-14T23:59:00.000Z"
    }
  ]
}
```

---

### Linee e percorsi

---

#### `GET /routes`
Tutte le linee GTT.

```bash
curl http://localhost:3000/routes
```

```json
[
  { "route_id": "T4",  "line": "4",  "name": "Falchera — Bengasi", "type": 0, "color": "#E2001A" },
  { "route_id": "B18", "line": "18", "name": "Centro — Mirafiori", "type": 3, "color": null },
  { "route_id": "M1",  "line": "1",  "name": "Fermi — Bengasi",    "type": 1, "color": "#0052A5" }
]
```

**Tipi di route (GTFS):** `0` = tram, `1` = metro, `3` = bus, `109` = ferrovia suburbana

---

#### `GET /routes/:routeId`
Dettaglio linea con tutte le fermate del percorso.

```bash
curl http://localhost:3000/routes/4
```

```json
{
  "route_id": "T4",
  "line": "4",
  "name": "Falchera — Bengasi",
  "type": 0,
  "color": "#E2001A",
  "stops": [
    { "stop_id": "0001", "stop_name": "Falchera Capolinea", "stop_lat": 45.12, "stop_lon": 7.69, "stop_sequence": 1 },
    { "stop_id": "0050", "stop_name": "Porta Nuova",         "stop_lat": 45.06, "stop_lon": 7.67, "stop_sequence": 50 }
  ]
}
```

---

### Corsa live

---

#### `GET /trips/:tripId`
Dettaglio di una corsa: fermate rimanenti + posizione GPS del veicolo in tempo reale.
Utile per la schermata "segui il tuo mezzo sulla mappa".

```bash
curl http://localhost:3000/trips/GTT_T4_001_20260307
```

```json
{
  "trip_id": "GTT_T4_001_20260307",
  "line": "4",
  "headsign": "Falchera",
  "vehicle_position": {
    "lat": 45.0661,
    "lon": 7.6835,
    "bearing": 0,
    "speed_kmh": 18
  },
  "stops": [
    { "stop_id": "1533", "stop_name": "Porta Nuova", "arrival_time": "10:24:00", "stop_sequence": 22 },
    { "stop_id": "1540", "stop_name": "Carlo Felice", "arrival_time": "10:27:00", "stop_sequence": 23 }
  ]
}
```

---

### Utilità

---

#### `GET /health`
Stato del servizio.

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "gtfs_loaded": true,
  "stop_count": 2841,
  "cache_keys": 4,
  "uptime_s": 3600
}
```

---

#### `POST /admin/sync-gtfs`
Forza la risincronizzazione del GTFS statico (richiede token admin).

```bash
curl -X POST http://localhost:3000/admin/sync-gtfs \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Sorgenti dati GTT reali

| Feed | URL |
|---|---|
| GTFS Statico | `http://aperto.comune.torino.it/dataset/feed-gtfs-trasporti-gtt/resource/88035475-b429-40de-ba64-99de232d6327` |
| GTFS-RT Trip Updates | `http://percorsieorari.gtt.to.it/das_gtfsrt/trip_update.aspx` |
| GTFS-RT Vehicle Positions | `http://percorsieorari.gtt.to.it/das_gtfsrt/vehicle_position.aspx` |
| GTFS-RT Service Alerts | `http://percorsieorari.gtt.to.it/das_gtfsrt/alerts.aspx` |

---

## Quick start

```bash
npm install
ADMIN_TOKEN=mysecret node server.js
```
