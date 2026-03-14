import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  TouchableOpacity,
  type ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';
import Svg, { Circle, Path, Rect, G, Ellipse, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function IllustrationBus() {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Circle cx={110} cy={110} r={100} fill={Colors.primaryLight} />
      <Rect x={60} y={60} width={100} height={100} rx={20} fill={Colors.primary} />
      <Rect x={70} y={75} width={80} height={35} rx={6} fill="#FFF" />
      <Circle cx={85} cy={145} r={10} fill="#333" />
      <Circle cx={135} cy={145} r={10} fill="#333" />
      <Circle cx={85} cy={145} r={5} fill="#999" />
      <Circle cx={135} cy={145} r={5} fill="#999" />
      <Rect x={105} y={115} width={10} height={20} rx={3} fill="#FFF" opacity={0.5} />
      <Circle cx={80} cy={90} r={3} fill={Colors.primary} />
      <Circle cx={140} cy={90} r={3} fill={Colors.primary} />
    </Svg>
  );
}

function IllustrationMap() {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Circle cx={110} cy={110} r={100} fill={Colors.primaryLight} />
      <Path d="M70 70 L110 55 L150 70 L150 150 L110 165 L70 150 Z" fill="#FFF" opacity={0.9} />
      <Path d="M70 70 L110 55 L110 165 L70 150 Z" fill={Colors.primary} opacity={0.3} />
      <Path d="M110 55 L150 70 L150 150 L110 165 Z" fill={Colors.primary} opacity={0.15} />
      <Circle cx={110} cy={100} r={15} fill={Colors.primary} />
      <Circle cx={110} cy={97} r={6} fill="#FFF" />
      <Path d="M110 115 L110 108" stroke={Colors.primary} strokeWidth={3} />
    </Svg>
  );
}

function IllustrationRealtime() {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Circle cx={110} cy={110} r={100} fill={Colors.primaryLight} />
      <Circle cx={110} cy={105} r={40} fill={Colors.primary} />
      <Path d="M110 75 L110 105 L130 115" stroke="#FFF" strokeWidth={4} strokeLinecap="round" fill="none" />
      <Circle cx={110} cy={105} r={5} fill="#FFF" />
      <Path d="M140 75 L155 65" stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <Path d="M148 95 L162 90" stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <Path d="M80 75 L65 65" stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <Circle cx={145} cy={70} r={8} fill="#27AE60" />
      <SvgText x={141} y={74} fill="#FFF" fontSize={10} fontWeight="bold">✓</SvgText>
    </Svg>
  );
}

interface Slide {
  id: string;
  illustration: React.ReactNode;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    illustration: <IllustrationBus />,
    title: 'GTT Torino\nal tuo servizio',
    subtitle: 'Cerca fermate, scopri le linee e muoviti per Torino con il trasporto pubblico.',
  },
  {
    id: '2',
    illustration: <IllustrationMap />,
    title: 'Mappa\nin tempo reale',
    subtitle: 'Visualizza sulla mappa dove si trovano bus e tram in questo momento.',
  },
  {
    id: '3',
    illustration: <IllustrationRealtime />,
    title: 'Arrivi live\nalla tua fermata',
    subtitle: 'Controlla gli orari reali dei prossimi passaggi e non perdere mai più la corsa.',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <FlatList
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.illustrationWrap}>{item.illustration}</View>
            <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.slideSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
            const scale = scrollX.interpolate({ inputRange, outputRange: [1, 1.4, 1], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { backgroundColor: colors.primary, opacity, transform: [{ scale }] }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Inizia' : 'Continua'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  illustrationWrap: { marginBottom: 40 },
  slideTitle: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  continueBtn: {
    height: 54,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: { fontFamily: Fonts.semiBold, fontSize: 17, color: '#FFF' },
});
