import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useTheme();

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Impostazioni</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>GTT Torino</Text>

        <View style={[styles.themeCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>Tema</Text>
          <View style={styles.themeButtons}>
            {(['system', 'light', 'dark'] as const).map((m) => {
              const label = m === 'system' ? 'Sistema' : m === 'dark' ? 'Scura' : 'Chiara';
              const isActive = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.themeBtn,
                    { borderColor: colors.primary },
                    isActive && { backgroundColor: colors.primary },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setMode(m)}
                >
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: colors.primary },
                      isActive && { color: '#FFFFFF' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  themeCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  themeLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    letterSpacing: -0.72,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  themeBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    letterSpacing: -0.3,
  },
});
