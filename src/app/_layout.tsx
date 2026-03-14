import React, { useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import {
  useFonts,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useThemeColors } from '../store/ThemeContext';
import OnboardingScreen from '../screens/OnboardingScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

function TabLayoutInner() {
  const colors = useThemeColors();
  const [fontsLoaded] = useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const [showOnboarding, setShowOnboarding] = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.backgroundGradientStart }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        tintColor={colors.tabBarActive}
        ignoreTopSafeArea
      >
        <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
          <NativeTabs.Trigger.Label>Fermate</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'mappin.circle', selected: 'mappin.circle.fill' }}
            md="place"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="lines" disableTransparentOnScrollEdge>
          <NativeTabs.Trigger.Label>Linee</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'bus', selected: 'bus.fill' }}
            md="directions_bus"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="map" disableTransparentOnScrollEdge>
          <NativeTabs.Trigger.Label>Mappa</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'map', selected: 'map.fill' }}
            md="map"
          />
        </NativeTabs.Trigger>


        <NativeTabs.Trigger name="profile" disableTransparentOnScrollEdge>
          <NativeTabs.Trigger.Label>Altro</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
            md="settings"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

export default function TabLayout() {
  return (
    <ThemeProvider>
      <TabLayoutInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
