import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface Props {
  color: string;
  size?: number;
  label?: string;
}

/** Colored circle with white border and pulsing ring animation */
export default function LiveVehicleDot({ color, size = 18, label }: Props) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View style={styles.wrapper}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />
      {/* Main dot */}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            borderWidth: size * 0.18,
          },
        ]}
      />
      {/* Optional line label */}
      {label && (
        <View style={[styles.labelBg, { backgroundColor: color }]}>
          <Animated.Text style={styles.labelText}>{label}</Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  pulse: {
    position: 'absolute',
  },
  dot: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  labelBg: {
    position: 'absolute',
    bottom: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  labelText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
