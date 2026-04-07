import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  useEffect(() => {
    // Load Google Fonts for web
    if (Platform.OS === 'web') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Apply font globally
      document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
      document.body.style.backgroundColor = Colors.bgPrimary;
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflowX = 'hidden';

      // Set page title
      document.title = 'Shrinkly — Shrink Your Links, Grow Your Reach';

      // Meta description
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Shrinkly is a modern URL shortener with powerful analytics, ad monetization, and link management. Shorten, share, and earn.';
      document.head.appendChild(meta);

      // Theme color
      const themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = Colors.bgPrimary;
      document.head.appendChild(themeColor);
    }
  }, []);

  return (
    <AuthProvider>
      {Platform.OS === 'web' && (
        <Head>
          <title>Shrinkly — Shrink Your Links, Grow Your Reach</title>
          <meta name="description" content="Shrinkly is a modern URL shortener with powerful analytics, ad monetization, and link management. Shorten, share, and earn." />
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4000404993258529" crossorigin="anonymous" />
        </Head>
      )}
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={Colors.bgPrimary} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bgPrimary },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="links" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="go/[code]" />
        </Stack>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
});
