import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { BorderRadius, Spacing } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';

function ShimmerBlock({ width, height, borderRadius = 8, style }: { width: number | string; height: number; borderRadius?: number; style?: any }) {
  const colors = useThemeColors();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: colors.primaryLight },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonHealthCardFull() {
  const colors = useThemeColors();
  return (
    <View style={[styles.cardFull, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.cardFullHeader}>
        <ShimmerBlock width={80} height={20} />
        <ShimmerBlock width={60} height={20} />
      </View>
      <View style={styles.graphArea}>
        <ShimmerBlock width="90%" height={60} borderRadius={12} />
      </View>
    </View>
  );
}

export function SkeletonHealthCardSmall() {
  const colors = useThemeColors();
  return (
    <View style={[styles.cardSmall, { backgroundColor: colors.cardBackground }]}>
      <ShimmerBlock width={70} height={18} style={{ marginBottom: 8 }} />
      <ShimmerBlock width="80%" height={50} borderRadius={10} />
      <View style={{ flex: 1 }} />
      <ShimmerBlock width={50} height={18} />
    </View>
  );
}

export function SkeletonAppointmentCard() {
  const colors = useThemeColors();
  return (
    <View style={[styles.appointmentCard, { backgroundColor: colors.cardBackground }]}>
      <ShimmerBlock width={80} height={22} borderRadius={11} />
      <View style={styles.doctorRow}>
        <ShimmerBlock width={38} height={38} borderRadius={19} />
        <View style={{ flex: 1, gap: 6 }}>
          <ShimmerBlock width="70%" height={14} />
          <ShimmerBlock width="40%" height={12} />
        </View>
      </View>
      <ShimmerBlock width="85%" height={12} style={{ marginTop: 4 }} />
      <ShimmerBlock width="75%" height={12} style={{ marginTop: 6 }} />
      <View style={[styles.priceRow, { borderTopColor: colors.textSecondary + '22' }]}>
        <ShimmerBlock width={90} height={12} />
        <ShimmerBlock width={40} height={16} />
      </View>
    </View>
  );
}

export function SkeletonSuggestionCard() {
  const colors = useThemeColors();
  return (
    <View style={[styles.suggestionCard, { backgroundColor: colors.cardBackground }]}>
      <ShimmerBlock width={28} height={28} borderRadius={14} style={{ marginBottom: 8 }} />
      <ShimmerBlock width="60%" height={16} style={{ marginBottom: 8 }} />
      <ShimmerBlock width="100%" height={12} />
      <ShimmerBlock width="90%" height={12} style={{ marginTop: 4 }} />
      <ShimmerBlock width="50%" height={12} style={{ marginTop: 4 }} />
      <View style={{ flex: 1 }} />
      <ShimmerBlock width={80} height={32} borderRadius={16} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardFull: {
    borderRadius: BorderRadius.lg,
    height: 178,
    overflow: 'hidden',
    padding: 16,
    gap: 12,
  },
  cardFullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  graphArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSmall: {
    borderRadius: BorderRadius.lg,
    height: 178,
    flex: 1,
    overflow: 'hidden',
    padding: 16,
  },
  appointmentCard: {
    borderRadius: BorderRadius.lg,
    padding: 18,
    width: 290,
    gap: 12,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  suggestionCard: {
    borderRadius: BorderRadius.lg,
    padding: 18,
    width: 260,
    height: 220,
  },
});
