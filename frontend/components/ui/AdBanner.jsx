import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function AdBanner({ 
  size = 'banner', // banner, rectangle, leaderboard, native
  style,
  slotId = '',
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const sizeConfig = {
    banner: { width: Math.min(728, screenWidth - 32), height: 90, label: 'Advertisement' },
    rectangle: { width: 300, height: 250, label: 'Sponsored' },
    leaderboard: { width: Math.min(728, screenWidth - 32), height: 90, label: 'Advertisement' },
    native: { width: '100%', height: 120, label: 'Sponsored Content' },
  };

  const config = sizeConfig[size];

  // In production, this would render actual AdSense/AdMob code
  // For now, show a styled placeholder
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          width: config.width,
          height: config.height,
        },
        style,
      ]}
    >
      <View style={styles.adContent}>
        <Text style={styles.adLabel}>{config.label}</Text>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adIcon}>📢</Text>
          <Text style={styles.adText}>Ad Space</Text>
          <Text style={styles.adSubtext}>Your ad could be here</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(124, 58, 237, 0.03)',
    marginVertical: Spacing.md,
  },
  adContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  adLabel: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  adPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  adText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  adSubtext: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: 2,
    opacity: 0.6,
  },
});
