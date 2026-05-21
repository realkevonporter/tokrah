import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Octicons from '@expo/vector-icons/MaterialIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme == 'dark' ? 'dark' : 'light'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme == 'dark' ? 'dark' : 'light'].text,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "home" :"home-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "cards" :"cards-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarBadge:4,
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "cards-heart" :"cards-heart-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}
