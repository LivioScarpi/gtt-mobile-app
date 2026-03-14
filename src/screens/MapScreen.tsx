import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import MapView, { Marker, MarkerAnimated, AnimatedRegion, Polyline, Region } from 'react-native-maps';
import LiveVehicleDot from '../components/LiveVehicleDot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';
import {
  getVehicles,
  getAllRoutes,
  getAllStops,
  getStopsForLine,
  getShapeForLine,
  getArrivals,
  getDirectionsForLine,
  type Vehicle,
  type Stop,
  type Route,
  type Arrival,
  type DirectionInfo,
} from '../services/gttApi';

const MAX_DELTA_FOR_STOPS = 0.025; // hide stops when too zoomed out

const TURIN_REGION: Region = {
  latitude: 45.0703,
  longitude: 7.6869,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const mapRef = useRef<MapView>(null);

  // Defer MapView mount to avoid RCTEventEmitter race condition on New Architecture
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Line selection
  const [lineFilter, setLineFilter] = useState('');
  const [filterInput, setFilterInput] = useState('');
  const [lineSearchQuery, setLineSearchQuery] = useState('');
  const [showLineSearch, setShowLineSearch] = useState(false);
  const [lineStops, setLineStops] = useState<Stop[]>([]);
  const [lineShape, setLineShape] = useState<{ latitude: number; longitude: number }[]>([]);
  const [lineDirections, setLineDirections] = useState<DirectionInfo[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null);

  // Stop selection → arrivals
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [stopArrivals, setStopArrivals] = useState<Arrival[]>([]);
  const [loadingArrivals, setLoadingArrivals] = useState(false);

  // Single tracked vehicle (only when user taps an arrival)
  const [trackedVehicle, setTrackedVehicle] = useState<Vehicle | null>(null);
  const [trackedArrival, setTrackedArrival] = useState<Arrival | null>(null);
  const trackedCoord = useRef(new AnimatedRegion({
    latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0,
  })).current;
  const vehicleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(TURIN_REGION);

  const allRoutes = useMemo(() => getAllRoutes(), []);
  const allStops = useMemo(() => getAllStops(), []);

  // Stops visible in the current viewport (when no line selected)
  const visibleStops = useMemo(() => {
    if (lineFilter) return lineStops; // line selected → show only its stops
    if (mapRegion.latitudeDelta > MAX_DELTA_FOR_STOPS) return []; // too zoomed out
    const latMin = mapRegion.latitude - mapRegion.latitudeDelta / 2;
    const latMax = mapRegion.latitude + mapRegion.latitudeDelta / 2;
    const lonMin = mapRegion.longitude - mapRegion.longitudeDelta / 2;
    const lonMax = mapRegion.longitude + mapRegion.longitudeDelta / 2;
    return allStops.filter(s =>
      s.lat >= latMin && s.lat <= latMax && s.lon >= lonMin && s.lon <= lonMax
    );
  }, [lineFilter, lineStops, mapRegion, allStops]);
  const lineSearchResults = useMemo(() => {
    if (!lineSearchQuery.trim()) return allRoutes.slice(0, 20);
    const q = lineSearchQuery.toLowerCase().trim();
    return allRoutes.filter(
      r => r.shortName.toLowerCase().includes(q) || r.longName.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allRoutes, lineSearchQuery]);

  const getVehicleColor = useCallback((line: string) => {
    const hash = line.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const hues = ['#D4002A', '#0068B4', '#27AE60', '#F39C12', '#8E44AD', '#E74C3C', '#2980B9'];
    return hues[hash % hues.length];
  }, []);

  // ── Stop tracking cleanup ─────────────────────
  const stopTracking = useCallback(() => {
    if (vehicleIntervalRef.current) {
      clearInterval(vehicleIntervalRef.current);
      vehicleIntervalRef.current = null;
    }
    setTrackedVehicle(null);
    setTrackedArrival(null);
  }, []);

  // ── Line filter ────────────────────────────────
  const applyFilter = useCallback((line: string) => {
    const cleaned = line.trim();
    setLineFilter(cleaned);
    setFilterInput(cleaned);
    setShowLineSearch(false);
    setLineSearchQuery('');
    setSelectedStop(null);
    setStopArrivals([]);
    stopTracking();
    if (cleaned) {
      const dirs = getDirectionsForLine(cleaned);
      setLineDirections(dirs);
      const dir = dirs.length > 0 ? dirs[0].dir : null;
      setSelectedDirection(dir);
      const stops = getStopsForLine(cleaned, dir ?? undefined);
      setLineStops(stops);
      const shape = getShapeForLine(cleaned, dir ?? undefined);
      setLineShape(shape);
      const fitCoords = shape.length > 0
        ? shape
        : stops.map(s => ({ latitude: s.lat, longitude: s.lon }));
      if (fitCoords.length > 0 && mapRef.current) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(fitCoords, {
            edgePadding: { top: 120, right: 40, bottom: 120, left: 40 },
            animated: true,
          });
        }, 300);
      }
    } else {
      setLineStops([]);
      setLineShape([]);
      setLineDirections([]);
      setSelectedDirection(null);
    }
  }, [stopTracking]);

  const clearFilter = useCallback(() => {
    setFilterInput('');
    setLineFilter('');
    setShowLineSearch(false);
    setLineSearchQuery('');
    setLineStops([]);
    setLineShape([]);
    setLineDirections([]);
    setSelectedDirection(null);
    setSelectedStop(null);
    setStopArrivals([]);
    stopTracking();
  }, [stopTracking]);

  // ── Stop press → load arrivals ──────────────────
  const handleStopPress = useCallback(async (stop: Stop) => {
    stopTracking();
    setSelectedStop(stop);
    setLoadingArrivals(true);
    setStopArrivals([]);
    try {
      const arrivals = await getArrivals(stop.id);
      setStopArrivals(arrivals);
    } catch {
      setStopArrivals([]);
    } finally {
      setLoadingArrivals(false);
    }
  }, [stopTracking]);

  // ── Switch direction for current line ──────────
  const switchDirection = useCallback((dir: number) => {
    if (!lineFilter) return;
    setSelectedDirection(dir);
    stopTracking();
    setSelectedStop(null);
    setStopArrivals([]);
    const stops = getStopsForLine(lineFilter, dir);
    setLineStops(stops);
    const shape = getShapeForLine(lineFilter, dir);
    setLineShape(shape);
    const fitCoords = shape.length > 0
      ? shape
      : stops.map(s => ({ latitude: s.lat, longitude: s.lon }));
    if (fitCoords.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(fitCoords, {
          edgePadding: { top: 120, right: 40, bottom: 120, left: 40 },
          animated: true,
        });
      }, 300);
    }
  }, [lineFilter, stopTracking]);

  // ── Tap an arrival → track that single vehicle ──
  const startTracking = useCallback(async (arrival: Arrival) => {
    stopTracking();
    setTrackedArrival(arrival);
    setLoading(true);

    // Update map to show the tracked line's route + stops
    if (arrival.line !== lineFilter) {
      setLineFilter(arrival.line);
      setFilterInput(arrival.line);
      const dirs = getDirectionsForLine(arrival.line);
      setLineDirections(dirs);
      const dir = dirs.length > 0 ? dirs[0].dir : null;
      setSelectedDirection(dir);
      const stops = getStopsForLine(arrival.line, dir ?? undefined);
      setLineStops(stops);
      setLineShape(getShapeForLine(arrival.line, dir ?? undefined));
    }

    try {
      const vehicles = await getVehicles(arrival.line);
      let target: Vehicle | null = null;
      if (arrival.vehicleId) {
        target = vehicles.find(v => v.vehicleId === arrival.vehicleId) ?? null;
      }
      if (!target) {
        target = vehicles.find(v => v.tripId === arrival.tripId) ?? null;
      }
      if (!target && selectedStop && vehicles.length > 0) {
        let closest = vehicles[0];
        let minDist = Infinity;
        for (const v of vehicles) {
          const d = Math.hypot(v.lat - selectedStop.lat, v.lon - selectedStop.lon);
          if (d < minDist) { minDist = d; closest = v; }
        }
        target = closest;
      }

      if (target) {
        // Set position BEFORE showing the marker to avoid flash at old coords
        trackedCoord.setValue({
          latitude: target.lat, longitude: target.lon,
          latitudeDelta: 0, longitudeDelta: 0,
        });
        setTrackedVehicle(target);
        if (selectedStop) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates([
              { latitude: selectedStop.lat, longitude: selectedStop.lon },
              { latitude: target!.lat, longitude: target!.lon },
            ], {
              edgePadding: { top: 140, right: 60, bottom: 300, left: 60 },
              animated: true,
            });
          }, 200);
        }
        // Poll only this vehicle every 10s
        const trackedId = target.vehicleId;
        vehicleIntervalRef.current = setInterval(async () => {
          try {
            const fresh = await getVehicles(arrival.line);
            const updated = fresh.find(v => v.vehicleId === trackedId)
              ?? fresh.find(v => v.tripId === arrival.tripId);
            if (updated) {
              setTrackedVehicle(updated);
              trackedCoord.timing({
                latitude: updated.lat, longitude: updated.lon,
                latitudeDelta: 0, longitudeDelta: 0,
                duration: 1200, toValue: 0, useNativeDriver: false,
              } as any).start();
            }
          } catch { /* ignore */ }
        }, 10000);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [selectedStop, trackedCoord, stopTracking, lineFilter]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (vehicleIntervalRef.current) clearInterval(vehicleIntervalRef.current);
    };
  }, []);

  // ── Dismiss stop card ──────────────────────────
  const dismissStopCard = useCallback(() => {
    setSelectedStop(null);
    setStopArrivals([]);
    stopTracking();
  }, [stopTracking]);

  // ── Render ────────────────────────────────────
  return (
    <View style={styles.container}>
      {mapReady ? (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={TURIN_REGION}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={setMapRegion}
      >
        {lineShape.length > 1 && (
          <Polyline
            coordinates={lineShape}
            strokeColor={lineFilter ? getVehicleColor(lineFilter) : '#D4002A'}
            strokeWidth={4}
          />
        )}
        {visibleStops.map((s, idx) => (
          <Marker
            key={`stop-${s.id}`}
            coordinate={{ latitude: s.lat, longitude: s.lon }}
            title={s.name}
            description={lineFilter
              ? `Fermata ${s.id} · ${idx + 1}/${lineStops.length}`
              : `Fermata ${s.id}`}
            pinColor={selectedStop?.id === s.id ? '#D4002A' : '#666666'}
            tracksViewChanges={false}
            onPress={() => handleStopPress(s)}
          />
        ))}
        {trackedVehicle && (
          <MarkerAnimated
            key={`tracked-${trackedVehicle.vehicleId}`}
            coordinate={trackedCoord as any}
            tracksViewChanges={true}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10}
          >
            <LiveVehicleDot
              color={getVehicleColor(trackedVehicle.line)}
              size={22}
              label={trackedVehicle.line}
            />
          </MarkerAnimated>
        )}
      </MapView>
      ) : (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.filterToggle, { backgroundColor: colors.cardBackground }]}
          onPress={() => setShowLineSearch(!showLineSearch)}
        >
          <Text style={[styles.filterToggleText, { color: colors.textPrimary }]}>
            {lineFilter ? `Linea ${lineFilter}` : 'Seleziona una linea'}
          </Text>
          {lineFilter ? (
            <Text style={[styles.vehicleCount, { color: colors.textSecondary }]}>
              {lineStops.length} fermate
            </Text>
          ) : null}
        </TouchableOpacity>
        {loading && (
          <View style={[styles.loadingPill, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {/* ── Direction picker ── */}
      {lineFilter && lineDirections.length > 1 && !showLineSearch && (
        <View style={[styles.directionBar, { top: insets.top + 56, backgroundColor: colors.cardBackground }]}>
          {lineDirections.map((d) => (
            <TouchableOpacity
              key={d.dir}
              style={[
                styles.directionBtn,
                selectedDirection === d.dir && { backgroundColor: getVehicleColor(lineFilter) },
              ]}
              onPress={() => switchDirection(d.dir)}
            >
              <Text
                style={[
                  styles.directionText,
                  { color: selectedDirection === d.dir ? '#fff' : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {d.headsign}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Line search panel ── */}
      {showLineSearch && (
        <View style={[styles.filterPanel, { top: insets.top + 60, backgroundColor: colors.cardBackground, maxHeight: 350 }]}>
          <TextInput
            style={[styles.filterInput, { color: colors.textPrimary, backgroundColor: colors.background, marginBottom: 8 }]}
            placeholder="Cerca linea (es. 4, 15, STAR1...)"
            placeholderTextColor={colors.textSecondary}
            value={lineSearchQuery}
            onChangeText={setLineSearchQuery}
            autoCorrect={false}
            autoFocus
          />
          <FlatList
            data={lineSearchResults}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 240 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.lineResultRow}
                onPress={() => applyFilter(item.shortName)}
              >
                <View style={[styles.lineResultBadge, { backgroundColor: getVehicleColor(item.shortName) }]}>
                  <Text style={styles.lineResultBadgeText}>{item.shortName}</Text>
                </View>
                <Text style={[styles.lineResultName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.longName || item.shortName}
                </Text>
              </TouchableOpacity>
            )}
          />
          {lineFilter.length > 0 && (
            <TouchableOpacity onPress={clearFilter} style={styles.clearFilterBtn}>
              <Text style={[styles.clearFilterText, { color: colors.primary }]}>Rimuovi filtro</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Stop card: arrivals + tracked vehicle ── */}
      {selectedStop && (
        <View style={[styles.stopCard, { bottom: insets.bottom + 16, backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={dismissStopCard}>
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.stopCardTitle, { color: colors.textPrimary }]}>
            {selectedStop.name}
          </Text>
          <Text style={[styles.stopCardSub, { color: colors.textSecondary }]}>
            Fermata {selectedStop.id}
          </Text>

          {/* Tracked vehicle banner */}
          {trackedVehicle && trackedArrival && (
            <View style={[styles.trackedBanner, { backgroundColor: getVehicleColor(trackedArrival.line) + '15' }]}>
              <View style={styles.trackedDotWrap}>
                <View style={[styles.trackedDotInner, { backgroundColor: getVehicleColor(trackedArrival.line) }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trackedTitle, { color: colors.textPrimary }]}>
                  Linea {trackedArrival.line} — {trackedArrival.etaMin <= 0 ? 'In arrivo!' : `${trackedArrival.etaMin} min`}
                </Text>
                <Text style={[styles.trackedSub, { color: colors.textSecondary }]}>
                  Veicolo {trackedVehicle.vehicleId}
                  {trackedVehicle.speedKmh ? ` · ${trackedVehicle.speedKmh} km/h` : ''}
                  {' · '}{trackedArrival.realtimeTime}
                </Text>
              </View>
              <TouchableOpacity onPress={stopTracking} style={styles.trackedCloseBtn}>
                <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Arrivals list (only when NOT tracking a vehicle) */}
          {!trackedVehicle && (
            <>
              <Text style={[styles.arrivalsLabel, { color: colors.textSecondary }]}>
                Prossimi passaggi
              </Text>
              {loadingArrivals ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
              ) : stopArrivals.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nessun passaggio previsto al momento
                </Text>
              ) : (
                <ScrollView style={styles.arrivalsList} showsVerticalScrollIndicator={false}>
                  {stopArrivals.slice(0, 6).map((arr) => (
                    <TouchableOpacity
                      key={arr.tripId}
                      style={[styles.arrivalRow, { borderLeftColor: getVehicleColor(arr.line) }]}
                      onPress={() => startTracking(arr)}
                      activeOpacity={0.6}
                    >
                      <View style={[styles.arrivalBadge, { backgroundColor: getVehicleColor(arr.line) }]}>
                        <Text style={styles.arrivalBadgeText}>{arr.line}</Text>
                      </View>
                      <View style={styles.arrivalInfo}>
                        <Text style={[styles.arrivalEta, { color: colors.textPrimary }]}>
                          {arr.etaMin <= 0 ? 'In arrivo' : `${arr.etaMin} min`}
                        </Text>
                        <Text style={[styles.arrivalTime, { color: colors.textSecondary }]}>
                          {arr.realtimeTime}
                          {arr.delayMin > 0 && ` (+${arr.delayMin}')`}
                        </Text>
                      </View>
                      {arr.isRealtime && (
                        <View style={[styles.liveBadge, { backgroundColor: '#27AE60' }]}>
                          <Text style={styles.liveBadgeText}>LIVE</Text>
                        </View>
                      )}
                      <Text style={[styles.arrivalChevron, { color: colors.textSecondary }]}>›</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  // Top bar
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 8 },
  filterToggle: {
    flex: 1, borderRadius: BorderRadius.sm, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  filterToggleText: { fontFamily: Fonts.semiBold, fontSize: 15 },
  vehicleCount: { fontFamily: Fonts.regular, fontSize: 12 },
  loadingPill: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },

  // Direction picker
  directionBar: {
    position: 'absolute', left: 16, right: 16, flexDirection: 'row', borderRadius: BorderRadius.sm,
    padding: 4, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  directionBtn: {
    flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center',
  },
  directionText: {
    fontFamily: Fonts.medium, fontSize: 12,
  },

  // Filter panel
  filterPanel: {
    position: 'absolute', left: 16, right: 16, borderRadius: BorderRadius.sm, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  filterInput: {
    flex: 1, fontFamily: Fonts.regular, fontSize: 15, borderRadius: 10, paddingHorizontal: 14, height: 40,
  },
  clearFilterBtn: { marginTop: 10, alignItems: 'center' },
  clearFilterText: { fontFamily: Fonts.medium, fontSize: 13 },
  lineResultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, gap: 12 },
  lineResultBadge: { width: 44, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  lineResultBadgeText: { fontFamily: Fonts.bold, fontSize: 14, color: '#fff' },
  lineResultName: { fontFamily: Fonts.regular, fontSize: 14, flex: 1 },

  // Stop card
  stopCard: {
    position: 'absolute', left: 16, right: 16, borderRadius: BorderRadius.sm, padding: 18,
    maxHeight: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  closeBtn: { position: 'absolute', top: 8, right: 12, padding: 6, zIndex: 1 },
  closeBtnText: { fontSize: 16, fontFamily: Fonts.medium },
  stopCardTitle: { fontFamily: Fonts.semiBold, fontSize: 18, marginBottom: 2, paddingRight: 30 },
  stopCardSub: { fontFamily: Fonts.regular, fontSize: 13 },

  // Arrivals
  arrivalsLabel: { fontFamily: Fonts.medium, fontSize: 13, marginTop: 14, marginBottom: 8 },
  arrivalsList: { maxHeight: 240 },
  arrivalRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8,
    borderLeftWidth: 3, borderRadius: 8, marginBottom: 6, backgroundColor: 'rgba(0,0,0,0.02)',
  },
  arrivalBadge: {
    width: 40, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  arrivalBadgeText: { fontFamily: Fonts.bold, fontSize: 13, color: '#fff' },
  arrivalInfo: { flex: 1 },
  arrivalEta: { fontFamily: Fonts.semiBold, fontSize: 15 },
  arrivalTime: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },
  liveBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  liveBadgeText: { fontFamily: Fonts.bold, fontSize: 9, color: '#fff' },
  arrivalChevron: { fontSize: 22, fontFamily: Fonts.medium },
  emptyText: { fontFamily: Fonts.regular, fontSize: 13, textAlign: 'center', marginVertical: 16 },

  // Tracked vehicle banner
  trackedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, padding: 12, borderRadius: 10,
  },
  trackedDotWrap: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  trackedDotInner: { width: 8, height: 8, borderRadius: 4 },
  trackedTitle: { fontFamily: Fonts.semiBold, fontSize: 14 },
  trackedSub: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  trackedCloseBtn: { padding: 4 },
});
