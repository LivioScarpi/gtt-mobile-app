import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SparkleIcon } from './Icons';
import { Colors, Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';

interface SuggestionCardProps {
  title: string;
  body: string;
  extra?: string;
  buttonLabel: string;
  isNew?: boolean;
  onPress?: () => void;
}

export default function SuggestionCard({
  title,
  body,
  extra,
  buttonLabel,
  isNew = true,
  onPress,
}: SuggestionCardProps) {
  const colors = useThemeColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.cardBackground },
    ]}>
      {/* AI tag + unread dot */}
      <View style={styles.tagRow}>
        <View style={[styles.aiTag, { backgroundColor: colors.primaryLight }]}>
          <SparkleIcon size={12} color={colors.primary} />
          <Text style={[styles.aiTagText, { color: colors.primary }]}>Suggerito per te</Text>
        </View>
        {isNew && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

        <View style={styles.bodyContainer}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{body}</Text>
          {extra && (
            <Text style={[styles.extraText, { color: colors.textPrimary }]}>{extra}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 18,
    width: 306,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    gap: 14,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  aiTagText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11.5,
    letterSpacing: -0.2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    gap: 10,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 19,
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  bodyContainer: {
    gap: 8,
  },
  bodyText: {
    fontFamily: Fonts.regular,
    fontSize: 14.5,
    color: Colors.textSecondary,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  extraText: {
    fontFamily: Fonts.medium,
    fontSize: 14.5,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.white,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
});
