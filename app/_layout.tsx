import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import * as Sentry from '@sentry/react-native';
import useAuthStore from '@/store/auth.store';

// Load CSS only on web (your file is app/globals.css)
if (Platform.OS === 'web') {
  require('./globals.css');
}

Sentry.init({
  dsn: 'https://94edd17ee98a307f2d85d750574c454a@o4506876178464768.ingest.us.sentry.io/4509588544094208',
  sendDefaultPii: true,
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

// Avoid auto-hiding until we're ready (fonts + auth)
SplashScreen.preventAutoHideAsync().catch(() => {});

export default Sentry.wrap(function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    'QuickSand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'QuickSand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'QuickSand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'QuickSand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'QuickSand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
  });

  // Kick off auth check once
  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  // Hide splash when both fonts and auth are ready
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isLoading, error]);

  // Gate render until ready
  if (!fontsLoaded || isLoading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
});

Sentry.showFeedbackWidget();
