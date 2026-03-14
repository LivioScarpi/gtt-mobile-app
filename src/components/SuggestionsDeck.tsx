import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, PanResponder, Animated as RNAnimated } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import SuggestionCard from './SuggestionCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CARD_WIDTH = 306;
const CARD_GAP = 12;
const SWIPE_THRESHOLD = 120;

interface DeckCardProps {
  item: any;
  index: number;
  isExpanded: boolean;
  onPressExpand: () => void;
  onDismiss: (id: string) => void;
  enterDelay: number;
}

function DeckCard({ item, index, isExpanded, onPressExpand, onDismiss, enterDelay }: DeckCardProps) {
  const expandProgress = useSharedValue(0);
  const enterProgress = useSharedValue(0);

  // PanResponder swipe (RN Animated)
  const swipeX = useRef(new RNAnimated.Value(0)).current;
  const swipeOpacity = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    enterProgress.value = withDelay(
      enterDelay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  useEffect(() => {
    expandProgress.value = withSpring(isExpanded ? 1 : 0, {
      damping: 14,
      stiffness: 120,
    });
  }, [isExpanded]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        isExpanded && Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => {
        swipeX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD || Math.abs(g.vx) > 0.8) {
          const direction = g.dx > 0 ? 1 : -1;
          RNAnimated.parallel([
            RNAnimated.timing(swipeX, { toValue: direction * 400, duration: 250, useNativeDriver: true }),
            RNAnimated.timing(swipeOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDismiss(item.id);
          });
        } else {
          RNAnimated.spring(swipeX, { toValue: 0, useNativeDriver: true, tension: 60, friction: 9 }).start();
        }
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => {
    const rotationBase = index === 0 ? 0 : index % 2 === 1 ? -4 : 4;
    const rotate = interpolate(expandProgress.value, [0, 1], [rotationBase, 0]);
    const scaleBase = index === 0 ? 1 : 1 - (index * 0.05);
    const scale = interpolate(expandProgress.value, [0, 1], [scaleBase, 1]);
    const yBase = index * 14;
    const translateY = interpolate(expandProgress.value, [0, 1], [yBase, 0]);
    const translateX = interpolate(
      expandProgress.value,
      [0, 1],
      [0, index * (CARD_WIDTH + CARD_GAP)]
    );

    const enterY = interpolate(enterProgress.value, [0, 1], [30, 0]);
    const enterOpacity = enterProgress.value;

    return {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      zIndex: 10 - index,
      opacity: enterOpacity,
      transform: [
        { translateX },
        { translateY: translateY + enterY },
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={() => {
        if (!isExpanded) onPressExpand();
      }}
    >
      <RNAnimated.View
        {...(isExpanded ? panResponder.panHandlers : {})}
        style={{ transform: [{ translateX: swipeX }], opacity: swipeOpacity }}
      >
        <SuggestionCard
          title={item.title}
          body={item.body}
          extra={item.extra}
          buttonLabel={item.buttonLabel}
          isNew={item.isNew !== false}
          onPress={() => {
            if (!isExpanded) onPressExpand();
          }}
        />
      </RNAnimated.View>
    </AnimatedPressable>
  );
}

interface SuggestionsDeckProps {
  suggestions: any[];
}

export default function SuggestionsDeck({ suggestions }: SuggestionsDeckProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState(suggestions);

  const handleDismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const containerWidth = useSharedValue(CARD_WIDTH + 20);

  useEffect(() => {
    containerWidth.value = withSpring(
      isExpanded ? items.length * CARD_WIDTH + (items.length - 1) * CARD_GAP : CARD_WIDTH + 20,
      { damping: 14, stiffness: 120 }
    );
  }, [isExpanded, items.length]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    width: containerWidth.value,
  }));

  if (items.length === 0) return null;

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {items.map((item, index) => (
        <DeckCard
          key={item.id}
          item={item}
          index={index}
          isExpanded={isExpanded}
          onPressExpand={() => setIsExpanded(true)}
          onDismiss={handleDismiss}
          enterDelay={index * 100}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 320,
  },
});
