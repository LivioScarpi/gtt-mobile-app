import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, actionLabel = 'Mostra di più', onAction }: SectionHeaderProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.textAccent }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.96,
  },
  action: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textAccent,
    letterSpacing: -0.64,
  },
});
