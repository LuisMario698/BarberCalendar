import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/use-responsive';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const r = useResponsive();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: r.tabBarHeight,
          paddingTop: r.spacing.sm,
          paddingBottom: r.verticalScale(28),
        },
        tabBarLabelStyle: {
          fontSize: r.fontXs,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={r.iconLarge} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color }) => <IconSymbol size={r.iconLarge} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: 'Ganancias',
          tabBarIcon: ({ color }) => <IconSymbol size={r.iconLarge} name="chart.bar.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
