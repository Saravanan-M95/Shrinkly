import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, FontSizes, Spacing } from '../../constants/theme';

export default function AuthCallback() {
  const { handleOAuthToken } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const processToken = async () => {
      const token = params.token;
      if (token) {
        const result = await handleOAuthToken(token);
        if (result.success) {
          router.replace('/dashboard');
        } else {
          router.replace('/login?error=oauth_failed');
        }
      } else {
        router.replace('/login?error=no_token');
      }
    };
    processToken();
  }, [params.token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
});
