import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, BorderRadius, Spacing } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';
import {
  searchStops,
  getArrivals,
  getLinesForStop,
  type Stop,
  type Arrival,
} from '../services/gttApi';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const [linesAtStop, setLinesAtStop] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      setSearchResults(searchStops(text, 15));
    }, 200);
  }, []);

  const loadArrivals = useCallback(async (stopId: string) => {
    setLoadingArrivals(true);
    setError(null);
    try {
      const data = await getArrivals(stopId);
      setArrivals(data);
      if (data.length === 0) setError('Nessun passaggio previsto al momento');
    } catch {
      setError('Errore nel caricamento dei dati in tempo reale');
      setArrivals([]);
    } finally {
      setLoadingArrivals(false);
    }
  }, []);

  const selectStop = useCallback(async (stop: Stop) => {
    setSelectedStop(stop);
    setSearchResults([]);
    setQuery(stop.name);
    setError(null);
    setLinesAtStop(getLinesForStop(stop.id));
    await loadArrivals(stop.id);
  }, [loadArrivals]);

  const onRefresh = useCallback(async () => {
    if (!selectedStop) return;
    setRefreshing(true);
    await loadArrivals(selectedStop.id);
    setRefreshing(false);
  }, [selectedStop, loadArrivals]);

  useEffect(() => {
    if (!selectedStop) return;
    const interval = setInterval(() => loadArrivals(selectedStop.id), 30000);
    return () => clearInterval(interval);
  }, [selectedStop, loadArrivals]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setSelectedStop(null);
    setArrivals([]);
    setLinesAtStop([]);
    setError(null);
  }, []);

  const renderArrival = ({ item }: { item: Arrival }) => {
    const isDelayed = item.delayMin > 0;
    const etaText = item.etaMin <= 0 ? 'In arrivo' : `${item.etaMin} min`;
    return (
      <View style={[styles.arrivalCard, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.lineBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.lineBadgeText}>{item.line}</Text>
        </View>
        <View style={styles.arrivalInfo}>
          <Text style={[styles.arrivalEta, { color: colors.textPrimary }]}>{etaText}</Text>
          <View style={styles.arrivalTimeRow}>
            <Text style={[styles.arrivalTime, { color: colors.textSecondary }]}>
              {item.realtimeTime}
            </Text>
            {isDelayed && (
              <Text style={[styles.delayText, { color: (colors as any).delay }]}>
                +{item.delayMin} min
              </Text>
            )}
            {item.isRealtime && (
              <View style={[styles.realtimeDot, { backgroundColor: (colors as any).onTime }]} />
            )}
          </View>
        </View>
        {item.isRealtime && (
          <Text style={[styles.realtimeLabel, { color: (colors as any).onTime }]}>LIVE</Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>GTT Torino</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Trasporto urbano</Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Cerca fermata..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length > 0 && !selectedStop && (
          <View style={[styles.resultsDropdown, { backgroundColor: colors.cardBackground }]}>
            <FlatList
              data={searchResults}
              keyExtractor={(s) => s.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: stop }) => {
                const lines = getLinesForStop(stop.id);
                return (
                  <TouchableOpacity style={styles.resultItem} onPress={() => selectStop(stop)}>
                    <View style={styles.resultLeft}>
                      <Text style={[styles.resultName, { color: colors.textPrimary }]}>{stop.name}</Text>
                      <Text style={[styles.resultId, { color: colors.textSecondary }]}>Fermata {stop.id}</Text>
                    </View>
                    {lines.length > 0 && (
                      <View style={styles.resultLines}>
                        {lines.slice(0, 4).map(l => (
                          <View key={l} style={[styles.miniLineBadge, { backgroundColor: colors.primary + '18' }]}>
                            <Text style={[styles.miniLineText, { color: colors.primary }]}>{l}</Text>
                          </View>
                        ))}
                        {lines.length > 4 && (
                          <Text style={[styles.moreLines, { color: colors.textSecondary }]}>+{lines.length - 4}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {selectedStop && (
          <View style={[styles.stopHeader, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.stopName, { color: colors.textPrimary }]}>{selectedStop.name}</Text>
            <Text style={[styles.stopId, { color: colors.textSecondary }]}>Fermata {selectedStop.id}</Text>
            {linesAtStop.length > 0 && (
              <View style={styles.stopLines}>
                {linesAtStop.slice(0, 8).map(l => (
                  <View key={l} style={[styles.miniLineBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.miniLineText, { color: colors.primary }]}>{l}</Text>
                  </View>
                ))}
                {linesAtStop.length > 8 && (
                  <Text style={[styles.moreLines, { color: colors.textSecondary }]}>+{linesAtStop.length - 8}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {selectedStop && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Prossimi passaggi</Text>
            {loadingArrivals && arrivals.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Caricamento tempo reale...
                </Text>
              </View>
            ) : error && arrivals.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>{error}</Text>
              </View>
            ) : (
              <FlatList
                data={arrivals}
                keyExtractor={(item) => item.tripId}
                renderItem={renderArrival}
                contentContainerStyle={styles.arrivalsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
              />
            )}
          </>
        )}

        {!selectedStop && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🚌</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Cerca una fermata</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Digita il nome di una fermata per vedere i prossimi passaggi in tempo reale
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 16 },
  title: { fontFamily: Fonts.bold, fontSize: 34, letterSpacing: -0.5 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 15, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, height: '100%' },
  clearBtn: { padding: 8 },
  clearBtnText: { fontSize: 16, fontFamily: Fonts.medium },
  resultsDropdown: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: 8,
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  resultLeft: { flex: 1 },
  resultName: { fontFamily: Fonts.medium, fontSize: 15 },
  resultId: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  resultLines: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: 140 },
  miniLineBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  miniLineText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  moreLines: { fontFamily: Fonts.regular, fontSize: 11, alignSelf: 'center' },
  stopHeader: { borderRadius: BorderRadius.sm, padding: 16, marginBottom: 8 },
  stopName: { fontFamily: Fonts.semiBold, fontSize: 20 },
  stopId: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  stopLines: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 18, marginTop: 8, marginBottom: 12 },
  arrivalsList: { paddingBottom: 120, gap: 8 },
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    padding: 16,
  },
  lineBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lineBadgeText: { fontFamily: Fonts.bold, fontSize: 18, color: '#fff' },
  arrivalInfo: { flex: 1 },
  arrivalEta: { fontFamily: Fonts.semiBold, fontSize: 18 },
  arrivalTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  arrivalTime: { fontFamily: Fonts.regular, fontSize: 13 },
  delayText: { fontFamily: Fonts.medium, fontSize: 12 },
  realtimeDot: { width: 6, height: 6, borderRadius: 3 },
  realtimeLabel: { fontFamily: Fonts.bold, fontSize: 11, marginLeft: 12 },
  loadingBox: { alignItems: 'center', marginTop: 40 },
  loadingText: { fontFamily: Fonts.regular, fontSize: 14, marginTop: 12 },
  emptyCard: { borderRadius: BorderRadius.sm, padding: 24, alignItems: 'center' },
  emptyCardText: { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 22, marginBottom: 8 },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
