import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function AdBanner({ 
  size = 'banner', // banner, rectangle, leaderboard, native
  style,
  slotId = '',
}) {
  const { width: screenWidth } = useWindowDimensions();

  const sizeConfig = {
    banner: { width: Math.min(728, screenWidth - 32), height: 90, label: 'Advertisement', adSize: BannerAdSize.BANNER },
    rectangle: { width: 300, height: 250, label: 'Sponsored', adSize: BannerAdSize.MEDIUM_RECTANGLE },
    leaderboard: { width: Math.min(728, screenWidth - 32), height: 90, label: 'Advertisement', adSize: BannerAdSize.LEADERBOARD },
    native: { width: '100%', height: 120, label: 'Sponsored Content', adSize: BannerAdSize.ADAPTIVE_BANNER },
  };

  const config = sizeConfig[size];
  if (!config) return null;

  return (
    <View style={[styles.nativeContainer, { width: config.width }, style]}>
      <BannerAd
        unitId={TestIds.BANNER}
        size={config.adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => console.error('Ad failed to load: ', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    alignSelf: 'center',
    marginVertical: Spacing.md,
    backgroundColor: '#000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
