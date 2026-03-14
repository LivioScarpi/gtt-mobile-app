import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Host, Button as SwiftButton } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, labelStyle, containerShape, shadow, tint } from '@expo/ui/swift-ui/modifiers';
import { Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';
import { HISTORY_DATA, type HealthMetricType } from './HealthCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const METRIC_INFO: Record<HealthMetricType, { description: string; tips: string[]; stats: { label: string; compute: (vals: number[]) => string }[] }> = {
  weight: {
    description: 'Il tuo peso è stabile nell\'ultima settimana. Continua così!',
    tips: ['Pesati sempre alla stessa ora', 'Bevi acqua prima di misurarti', 'L\'andamento conta più del singolo valore'],
    stats: [
      { label: 'Media', compute: (v) => (v.reduce((a, b) => a + b) / v.length).toFixed(1) },
      { label: 'Min', compute: (v) => Math.min(...v).toFixed(1) },
      { label: 'Max', compute: (v) => Math.max(...v).toFixed(1) },
      { label: 'Variazione', compute: (v) => (v[v.length - 1] - v[0] > 0 ? '+' : '') + (v[v.length - 1] - v[0]).toFixed(1) },
    ],
  },
  heartRate: {
    description: 'Il tuo battito cardiaco è nella norma. Ottimo stato di salute cardiovascolare.',
    tips: ['Un battito a riposo tra 60-100 bpm è normale', 'L\'attività fisica regolare lo abbassa', 'Stress e caffeina possono alzarlo'],
    stats: [
      { label: 'Media', compute: (v) => Math.round(v.reduce((a, b) => a + b) / v.length).toString() },
      { label: 'Min', compute: (v) => Math.min(...v).toString() },
      { label: 'Max', compute: (v) => Math.max(...v).toString() },
      { label: 'Variazione', compute: (v) => (v[v.length - 1] - v[0] > 0 ? '+' : '') + (v[v.length - 1] - v[0]).toString() },
    ],
  },
  hydration: {
    description: 'Ricorda di bere almeno 1.8L al giorno per mantenerti idratato.',
    tips: ['Bevi un bicchiere appena sveglio', 'Porta sempre una bottiglia con te', 'Frutta e verdura contano nell\'idratazione'],
    stats: [
      { label: 'Media', compute: (v) => Math.round(v.reduce((a, b) => a + b) / v.length).toString() },
      { label: 'Min giorno', compute: (v) => Math.min(...v).toString() },
      { label: 'Max giorno', compute: (v) => Math.max(...v).toString() },
      { label: 'Totale', compute: (v) => v.reduce((a, b) => a + b).toString() },
    ],
  },
};

interface HealthDetailModalProps {
  visible: boolean;
  onClose: () => void;
  type: HealthMetricType;
  currentValue: string;
  unit: string;
  title: string;
}

function InteractiveGraph({ type }: { type: HealthMetricType }) {
  const colors = useThemeColors();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const data = HISTORY_DATA[type];
  const { values, days, color, unitLabel } = data;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const chartW = 320;
  const chartH = 140;
  const padX = 24;
  const padTop = 28;
  const padBottom = 24;

  const points = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (chartW - padX * 2),
    y: padTop + (1 - (v - minVal) / range) * (chartH - padTop - padBottom),
  }));

  let pathD = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const fillD = pathD + ` L${points[points.length - 1].x} ${chartH} L${points[0].x} ${chartH} Z`;

  const handlePress = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <View style={styles.graphWrap}>
      {selectedIndex !== null && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.tooltip, { backgroundColor: color }]}
        >
          <Text style={styles.tooltipValue}>
            {values[selectedIndex]} {unitLabel}
          </Text>
          <Text style={styles.tooltipDay}>{days[selectedIndex]}</Text>
        </Animated.View>
      )}
      <Svg width={chartW} height={chartH + 22} viewBox={`0 0 ${chartW} ${chartH + 22}`}>
        <Defs>
          <SvgLinearGradient id={`detailGrad_${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </SvgLinearGradient>
        </Defs>
        <Path d={fillD} fill={`url(#detailGrad_${color})`} />
        <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {points.map((p, i) => (
          <G key={i}>
            {selectedIndex === i && (
              <Line
                x1={p.x} y1={p.y + 9} x2={p.x} y2={chartH}
                stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.5}
              />
            )}
            <Circle
              cx={p.x} cy={p.y}
              r={selectedIndex === i ? 8 : 5}
              fill={selectedIndex === i ? color : colors.cardBackground}
              stroke={color} strokeWidth={2.5}
              onPress={() => handlePress(i)}
            />
            <SvgText
              x={p.x} y={chartH + 16}
              textAnchor="middle" fontSize={11}
              fontFamily="DMSans_500Medium"
              fill={selectedIndex === i ? color : colors.textSecondary}
            >
              {days[i]}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

export default function HealthDetailModal({ visible, onClose, type, currentValue, unit, title }: HealthDetailModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const data = HISTORY_DATA[type];
  const info = METRIC_INFO[type];

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.headerDot, { backgroundColor: data.color }]} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</Text>
        <View style={styles.closeBtnWrap}>
          <Host style={styles.closeBtnHost}>
            <SwiftButton
              systemImage="xmark"
              label="Chiudi"
              onPress={onClose}
              modifiers={[
                buttonStyle('glass'),
                controlSize('large'),
                ...(Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) < 26 ? [tint(colors.textPrimary)] : []),
                labelStyle('iconOnly'),
                containerShape({ shape: 'circle' }),
                shadow({ radius: 0 }),
              ]}
            />
          </Host>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
        {/* Current value */}
        <View style={[styles.currentCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>Valore attuale</Text>
          <Text style={[styles.currentValue, { color: data.color }]}>
            {currentValue}
            <Text style={styles.currentUnit}> {unit}</Text>
          </Text>
        </View>

        {/* Graph */}
        <View style={[styles.graphCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ultima settimana</Text>
          <InteractiveGraph type={type} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {info.stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {stat.compute(data.values)}
                <Text style={[styles.statUnit, { color: colors.textSecondary }]}> {data.unitLabel}</Text>
              </Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>{info.description}</Text>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Consigli</Text>
          {info.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: data.color }]} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 10,
  },
  headerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 28,
    letterSpacing: -1.12,
    flex: 1,
  },
  closeBtnWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnHost: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  currentCard: {
    borderRadius: BorderRadius.lg,
    padding: 20,
    alignItems: 'center',
  },
  currentLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    letterSpacing: -0.28,
    marginBottom: 4,
  },
  currentValue: {
    fontFamily: Fonts.bold,
    fontSize: 42,
    letterSpacing: -1.68,
  },
  currentUnit: {
    fontFamily: Fonts.regular,
    fontSize: 20,
  },
  graphCard: {
    borderRadius: BorderRadius.lg,
    padding: 18,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    letterSpacing: -0.72,
    marginBottom: 12,
  },
  graphWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  tooltipValue: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 15,
    letterSpacing: -0.3,
  },
  tooltipDay: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    borderRadius: BorderRadius.sm,
    padding: 14,
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    letterSpacing: -0.24,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    letterSpacing: -0.8,
  },
  statUnit: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: 18,
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  tipsCard: {
    borderRadius: BorderRadius.lg,
    padding: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  tipText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.28,
    flex: 1,
  },
});
