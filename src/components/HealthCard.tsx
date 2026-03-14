import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Historical data for each metric
export const HISTORY_DATA = {
  weight: {
    days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    values: [73.2, 72.8, 73.0, 72.5, 72.3, 72.6, 72.0],
    color: '#2F7988',
    unitLabel: 'Kg',
  },
  heartRate: {
    days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    values: [78, 82, 80, 86, 84, 79, 84],
    color: '#E88B8B',
    unitLabel: 'bpm',
  },
  hydration: {
    days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    values: [1600, 1200, 1850, 1400, 1700, 900, 250],
    color: '#8BB8E8',
    unitLabel: 'ml',
  },
};

export type HealthMetricType = 'weight' | 'heartRate' | 'hydration';

interface HealthCardProps {
  title: string;
  value: string;
  unit: string;
  type: HealthMetricType;
  fullWidth?: boolean;
  onPress?: () => void;
}

function WeightGraph() {
  const strokeProgress = useSharedValue(500);
  const fillOpacity = useSharedValue(0);

  useEffect(() => {
    strokeProgress.value = withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) });
    fillOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, []);

  const strokeAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeProgress.value,
  }));

  const fillAnimatedProps = useAnimatedProps(() => ({
    opacity: fillOpacity.value,
  }));

  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 130" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#2F7988" stopOpacity={0.18} />
          <Stop offset="100%" stopColor="#2F7988" stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <AnimatedPath
        d="M0 60 C30 55, 50 40, 80 45 C110 50, 130 35, 160 30 C190 25, 210 55, 240 50 C270 45, 290 35, 320 40 L320 130 L0 130 Z"
        fill="url(#weightGrad)"
        animatedProps={fillAnimatedProps}
      />
      <AnimatedPath
        d="M0 60 C30 55, 50 40, 80 45 C110 50, 130 35, 160 30 C190 25, 210 55, 240 50 C270 45, 290 35, 320 40"
        stroke="#2F7988"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={500}
        animatedProps={strokeAnimatedProps}
      />
    </Svg>
  );
}

function HeartRateGraph() {
  const strokeProgress = useSharedValue(400);
  const fillOpacity = useSharedValue(0);

  useEffect(() => {
    strokeProgress.value = withDelay(200, withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    fillOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
  }, []);

  const strokeAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeProgress.value,
  }));

  const fillAnimatedProps = useAnimatedProps(() => ({
    opacity: fillOpacity.value,
  }));

  return (
    <Svg width="100%" height="100%" viewBox="0 0 160 130" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#E88B8B" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#E88B8B" stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <AnimatedPath
        d="M0 50 C15 45, 25 55, 35 40 C45 25, 48 20, 55 35 C62 50, 70 60, 80 45 C90 30, 95 25, 105 40 C115 55, 125 45, 135 40 C145 35, 155 50, 160 45 L160 130 L0 130 Z"
        fill="url(#heartGrad)"
        animatedProps={fillAnimatedProps}
      />
      <AnimatedPath
        d="M0 50 C15 45, 25 55, 35 40 C45 25, 48 20, 55 35 C62 50, 70 60, 80 45 C90 30, 95 25, 105 40 C115 55, 125 45, 135 40 C145 35, 155 50, 160 45"
        stroke="#E88B8B"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={400}
        animatedProps={strokeAnimatedProps}
      />
    </Svg>
  );
}

function HydrationGraph() {
  const strokeProgress = useSharedValue(300);
  const fillOpacity = useSharedValue(0);

  useEffect(() => {
    strokeProgress.value = withDelay(400, withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    fillOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
  }, []);

  const strokeAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeProgress.value,
  }));

  const fillAnimatedProps = useAnimatedProps(() => ({
    opacity: fillOpacity.value,
  }));

  return (
    <Svg width="100%" height="100%" viewBox="0 0 160 130" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="hydroGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#8BB8E8" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#8BB8E8" stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <AnimatedPath
        d="M0 70 C20 60, 30 50, 50 55 C70 60, 80 40, 100 35 C120 30, 130 50, 160 45 L160 130 L0 130 Z"
        fill="url(#hydroGrad)"
        animatedProps={fillAnimatedProps}
      />
      <AnimatedPath
        d="M0 70 C20 60, 30 50, 50 55 C70 60, 80 40, 100 35 C120 30, 130 50, 160 45"
        stroke="#8BB8E8"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={300}
        animatedProps={strokeAnimatedProps}
      />
    </Svg>
  );
}

export default function HealthCard({ title, value, unit, type, fullWidth = false, onPress }: HealthCardProps) {
  const colors = useThemeColors();

  const handlePress = () => {
    onPress?.();
  };

  const renderGraph = () => {
    switch (type) {
      case 'weight':
        return <WeightGraph />;
      case 'heartRate':
        return <HeartRateGraph />;
      case 'hydration':
        return <HydrationGraph />;
    }
  };

  const isSmallCard = type === 'heartRate' || type === 'hydration';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.card, { backgroundColor: colors.cardBackground }, fullWidth && styles.fullWidth]}
    >
      {isSmallCard ? (
        <>
          <Text style={[styles.titleAbsolute, { color: colors.textPrimary }]}>{title}</Text>
          <View style={styles.graphContainer}>
            {renderGraph()}
          </View>
          <View style={styles.valueAbsolute}>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
            <Text style={[styles.unit, { color: colors.textPrimary }]}>{unit}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
              <Text style={[styles.unit, { color: colors.textPrimary }]}>{unit}</Text>
            </View>
          </View>
          <View style={styles.graphContainer}>
            {renderGraph()}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 178,
    flex: 1,
  },
  fullWidth: {
    flex: undefined,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.96,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.96,
  },
  unit: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.64,
  },
  titleAbsolute: {
    position: 'absolute',
    top: 14,
    left: 16,
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.96,
    zIndex: 1,
  },
  valueAbsolute: {
    position: 'absolute',
    bottom: 16,
    left: 21,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  graphContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 50,
  },
});
