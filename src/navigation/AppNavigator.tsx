import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LinesScreen from '../screens/LinesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LiquidGlassTabBar from './LiquidGlassTabBar';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Fermate" component={HomeScreen} />
      <Tab.Screen name="Linee" component={LinesScreen} />
      <Tab.Screen name="Mappa" component={MapScreen} />
      <Tab.Screen name="Altro" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
