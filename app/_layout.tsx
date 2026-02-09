import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// import { initDatabase } from '@/db/init';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { AppThemeProvider } from '@/context/ThemeContext';
import { useEffect } from 'react';
// import { checkAndResetWeek } from '@/db/reset-week';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // initDatabase();
    // checkAndResetWeek();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppThemeProvider>
        <AppointmentProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="book" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AppointmentProvider>
      </AppThemeProvider>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemeProvider>
  );
}
