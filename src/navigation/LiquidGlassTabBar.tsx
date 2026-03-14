import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MapPinIcon, BusIcon, MapIcon, SettingsIcon } from '../components/Icons';
import { Colors, Fonts } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';

const TAB_ICONS: Record<string, (props: { color: string; size: number; filled: boolean }) => React.ReactNode> = {
  index: ({ color, size, filled }) => <MapPinIcon size={size} color={color} />,
  Fermate: ({ color, size, filled }) => <MapPinIcon size={size} color={color} />,
  lines: ({ color, size, filled }) => <BusIcon size={size} color={color} filled={filled} />,
  Linee: ({ color, size, filled }) => <BusIcon size={size} color={color} filled={filled} />,
  map: ({ color, size, filled }) => <MapIcon size={size} color={color} filled={filled} />,
  Mappa: ({ color, size, filled }) => <MapIcon size={size} color={color} filled={filled} />,
  profile: ({ color, size, filled }) => <SettingsIcon size={size} color={color} filled={filled} />,
  Altro: ({ color, size, filled }) => <SettingsIcon size={size} color={color} filled={filled} />,
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function SpecularShine() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.shineContainer, animatedStyle]}>
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255, 255, 255, 0.08)',
          'rgba(255, 255, 255, 0.22)',
          'rgba(255, 255, 255, 0.08)',
          'transparent',
        ]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 0.7 }}
        locations={[0, 0.3, 0.5, 0.7, 1]}
        style={styles.shineGradient}
      />
    </Animated.View>
  );
}

export default function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Outer shadow layer */}
      <View style={styles.shadowLayer}>
        <View style={styles.container}>
          {/* Base glass material */}
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={40}
              tint="systemUltraThinMaterialLight"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}

          {/* Liquid Glass layering */}
          {/* 1. Base tint - very subtle warm fill */}
          <View style={[StyleSheet.absoluteFill, styles.glassTintBase]} />

          {/* 2. Top edge highlight - simulates light hitting the top of the glass */}
          <View style={styles.topHighlight} />

          {/* 3. Inner light gradient - the characteristic liquid glass luminance */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.18)',
              'rgba(255, 255, 255, 0.04)',
              'rgba(255, 255, 255, 0.0)',
              'rgba(255, 255, 255, 0.06)',
            ]}
            locations={[0, 0.35, 0.65, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* 4. Animated specular reflection */}
          <SpecularShine />

          {/* 5. Subtle inner border */}
          <View style={styles.innerBorder} />

          {/* Tab Buttons */}
          <View style={styles.tabRow}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = route.name;
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const color = isFocused ? colors.tabBarActive : colors.tabBarInactive;
              const displayLabel = (options.title || route.name) as string;
              const renderIcon = TAB_ICONS[route.name] || TAB_ICONS[displayLabel];

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  activeOpacity={0.7}
                  style={styles.tab}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                >
                  {isFocused && (
                    <View style={styles.activeIndicator}>
                      {Platform.OS === 'ios' && (
                        <BlurView
                          intensity={20}
                          tint="systemThinMaterialLight"
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <View style={styles.activeIndicatorTint} />
                    </View>
                  )}
                  <View style={styles.iconContainer}>
                    {renderIcon?.({ color, size: 24, filled: isFocused })}
                  </View>
                  <Text
                    style={[
                      styles.label,
                      { color },
                      isFocused && styles.labelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {displayLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  shadowLayer: {
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    borderRadius: 40,
    overflow: 'hidden',
    width: '100%',
  },
  androidFallback: {
    backgroundColor: 'rgba(250, 250, 252, 0.75)',
  },
  glassTintBase: {
    backgroundColor: 'rgba(245, 245, 247, 0.25)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  shineContainer: {
    overflow: 'hidden',
    borderRadius: 40,
  },
  shineGradient: {
    width: 200,
    height: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 6,
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
    position: 'relative',
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  activeIndicatorTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    zIndex: 1,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    letterSpacing: -0.56,
    textAlign: 'center',
    zIndex: 1,
  },
  labelActive: {
    fontFamily: Fonts.medium,
  },
});
