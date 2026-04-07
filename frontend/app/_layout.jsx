import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  useEffect(() => {
    // Load Google Fonts for web
    if (Platform.OS === 'web') {
      // Background and base setup
      document.body.style.backgroundColor = Colors.bgPrimary;
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflowX = 'hidden';
    }
  }, []);

  return (
    <AuthProvider>
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
