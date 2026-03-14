import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';
import {
  getAllRoutes,
  getRouteTypeLabel,
  getStopsForLine,
  type Route,
  type Stop,
} from '../services/gttApi';

export default function LinesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeStops, setRouteStops] = useState<Stop[]>([]);
  const [filter, setFilter] = useState<'all' | 'tram' | 'bus' | 'metro'>('all');

  const allRoutes = useMemo(() => getAllRoutes(), []);

  const filteredRoutes = useMemo(() => {
    let routes = allRoutes;
    if (filter === 'tram') routes = routes.filter(r => r.type === 0);
    else if (filter === 'bus') routes = routes.filter(r => r.type === 3);
    else if (filter === 'metro') routes = routes.filter(r => r.type === 1);

    if (query.length > 0) {
      const q = query.toLowerCase();
      routes = routes.filter(
        r => r.shortName.toLowerCase().includes(q) || r.longName.toLowerCase().includes(q)
      );
    }
    return routes;
  }, [allRoutes, query, filter]);

  const sections = useMemo(() => {
    const trams = filteredRoutes.filter(r => r.type === 0);
    const metros = filteredRoutes.filter(r => r.type === 1);
    const buses = filteredRoutes.filter(r => r.type === 3);
    const result = [];
    if (metros.length > 0) result.push({ title: 'Metropolitana', data: metros });
    if (trams.length > 0) result.push({ title: 'Tram', data: trams });
    if (buses.length > 0) result.push({ title: 'Bus', data: buses });
    return result;
  }, [filteredRoutes]);

  const selectRoute = useCallback((route: Route) => {
    if (selectedRoute?.id === route.id) {
      setSelectedRoute(null);
      setRouteStops([]);
      return;
    }
    setSelectedRoute(route);
    setRouteStops(getStopsForLine(route.shortName));
  }, [selectedRoute]);

  const getTypeColor = (type: number) => {
    switch (type) {
      case 0: return (colors as any).tram;
      case 1: return (colors as any).metro;
      case 3: return (colors as any).bus;
      default: return colors.primary;
    }
  };

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Tutte' },
    { key: 'metro', label: 'Metro' },
    { key: 'tram', label: 'Tram' },
    { key: 'bus', label: 'Bus' },
  ];

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Linee</Text>

        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Cerca linea..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
        </View>

        <View style={styles.filterRow}>
          {filterButtons.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f.key ? colors.primary : colors.cardBackground,
                },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  { color: filter === f.key ? '#FFF' : colors.textPrimary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionList
          style={{ flex: 1 }}
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item: route }) => (
            <View>
              <TouchableOpacity
                style={[styles.routeCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => selectRoute(route)}
                activeOpacity={0.7}
              >
                <View style={[styles.routeBadge, { backgroundColor: getTypeColor(route.type) }]}>
                  <Text style={styles.routeBadgeText}>{route.shortName}</Text>
                </View>
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {route.longName || route.shortName}
                  </Text>
                  <Text style={[styles.routeType, { color: colors.textSecondary }]}>
                    {getRouteTypeLabel(route.type)}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textSecondary }]}>
                  {selectedRoute?.id === route.id ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {selectedRoute?.id === route.id && routeStops.length > 0 && (
                <View style={[styles.stopsContainer, { backgroundColor: colors.cardBackground }]}>
                  {routeStops.map((stop, idx) => (
                    <View key={stop.id} style={styles.stopRow}>
                      <View style={styles.stopTimeline}>
                        <View style={[
                          styles.stopDot,
                          {
                            backgroundColor: idx === 0 || idx === routeStops.length - 1
                              ? getTypeColor(route.type)
                              : colors.textSecondary,
                          },
                        ]} />
                        {idx < routeStops.length - 1 && (
                          <View style={[styles.stopLine, { backgroundColor: colors.textSecondary + '30' }]} />
                        )}
                      </View>
                      <Text style={[styles.stopName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {stop.name}
                      </Text>
                      <Text style={[styles.stopIdLabel, { color: colors.textSecondary }]}>
                        {stop.id}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontFamily: Fonts.bold, fontSize: 34, letterSpacing: -0.5, marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, height: '100%' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterBtnText: { fontFamily: Fonts.medium, fontSize: 13 },
  listContent: { paddingBottom: 120 },
  sectionHeader: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    padding: 14,
    marginBottom: 6,
  },
  routeBadge: {
    width: 48,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  routeBadgeText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff' },
  routeInfo: { flex: 1 },
  routeName: { fontFamily: Fonts.medium, fontSize: 15 },
  routeType: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 10, marginLeft: 8 },
  stopsContainer: {
    borderRadius: BorderRadius.sm,
    padding: 16,
    marginBottom: 6,
    marginTop: -2,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },
  stopTimeline: { width: 20, alignItems: 'center' },
  stopDot: { width: 8, height: 8, borderRadius: 4, zIndex: 1 },
  stopLine: { width: 2, flex: 1, marginTop: -2 },
  stopName: { fontFamily: Fonts.regular, fontSize: 14, flex: 1, marginLeft: 10 },
  stopIdLabel: { fontFamily: Fonts.regular, fontSize: 11, marginLeft: 8 },
});
