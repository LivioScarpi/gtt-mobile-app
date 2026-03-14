import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useTheme();

  const modeLabel = mode === 'system' ? 'Sistema' : mode === 'dark' ? 'Scura' : 'Chiara';

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profilo</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Il tuo profilo apparirà qui</Text>

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
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 32,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    marginTop: 8,
    letterSpacing: -0.64,
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
