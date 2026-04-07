import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, useWindowDimensions, Platform, Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from '../../components/ui/AdBanner';
import { redirectAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';

export default function InterstitialPage() {
  const { code } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [redirectInfo, setRedirectInfo] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRedirectInfo();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      Animated.timing(progressAnim, {
        toValue: (5 - countdown + 1) / 5,
        duration: 1000,
        useNativeDriver: false,
      }).start();
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [countdown]);

  const loadRedirectInfo = async () => {
    try {
      const res = await redirectAPI.getRedirectInfo(code);
      setRedirectInfo(res.data);
    } catch (err) {
      setError('Link not found or has expired');
    }
  };

  const handleRedirect = () => {
    if (!redirectInfo?.originalUrl) return;
    if (Platform.OS === 'web') {
      window.location.href = redirectInfo.originalUrl;
    } else {
      Linking.openURL(redirectInfo.originalUrl);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (error) {
    return (
      <View style={styles.wrapper}>
        <LinearGradient colors={Colors.gradientHero} style={styles.container}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
            <Text style={styles.errorTitle}>Link Not Found</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={Colors.gradientHero} style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Top Ad */}
          <AdBanner size="leaderboard" />

          {/* Main Card */}
          <View style={[styles.card, isMobile && styles.cardMobile]}>
            {/* Logo */}
            <View style={styles.logoRow}>
              <LinearGradient colors={Colors.gradientPrimary} style={styles.logoIcon}>
                <Ionicons name="link" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>Shrinkly</Text>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
              <Text style={styles.countdownText}>
                {canSkip ? 'Ready!' : `Redirecting in ${countdown}s`}
              </Text>
            </View>

            {/* Destination Preview */}
            <View style={styles.destinationCard}>
              <Ionicons name="globe-outline" size={20} color={Colors.textMuted} />
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationLabel}>You will be redirected to:</Text>
                <Text style={styles.destinationUrl} numberOfLines={2}>
                  {redirectInfo?.originalUrl || 'Loading...'}
                </Text>
              </View>
            </View>

            {/* Redirect Button */}
            <TouchableOpacity
              onPress={handleRedirect}
              disabled={!canSkip}
              activeOpacity={0.8}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={canSkip ? Colors.gradientPrimary : ['#4A4458', '#3D3652']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.redirectBtn, !canSkip && styles.redirectBtnDisabled]}
              >
                <Ionicons
                  name={canSkip ? 'arrow-forward-circle' : 'time-outline'}
                  size={22}
                  color="#fff"
                />
                <Text style={styles.redirectBtnText}>
                  {canSkip ? 'Continue to Destination' : `Wait ${countdown} seconds...`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Safety Notice */}
            <View style={styles.safetyRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.safetyText}>
                This link was shortened with Shrinkly. We are not responsible for external content.
              </Text>
            </View>
          </View>

          {/* Rectangle Ad */}
          <AdBanner size="rectangle" />

          {/* Bottom Text */}
          <Text style={styles.footerText}>
            Powered by <Text style={{ color: Colors.primaryLight, fontWeight: '700' }}>Shrinkly</Text> — Free URL Shortener
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  content: { alignItems: 'center', width: '100%', maxWidth: 600 },

  card: {
    backgroundColor: Colors.glass, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.glassBorder,
    padding: Spacing.xl + 8, width: '100%', alignItems: 'center', ...Shadows.lg, marginVertical: Spacing.lg,
  },
  cardMobile: { padding: Spacing.lg },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  logoIcon: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },

  progressContainer: { width: '100%', marginBottom: Spacing.xl, alignItems: 'center' },
  progressTrack: {
    width: '100%', height: 6, backgroundColor: Colors.bgTertiary,
    borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  progressGradient: { flex: 1 },
  countdownText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },

  destinationCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm + 4,
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderLight,
    padding: Spacing.md, width: '100%', marginBottom: Spacing.lg,
  },
  destinationInfo: { flex: 1 },
  destinationLabel: { color: Colors.textMuted, fontSize: FontSizes.xs, fontWeight: '600', marginBottom: Spacing.xs },
  destinationUrl: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '500', lineHeight: 20 },

  redirectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, width: '100%',
  },
  redirectBtnDisabled: { opacity: 0.7 },
  redirectBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '700' },

  safetyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.md },
  safetyText: { color: Colors.textMuted, fontSize: FontSizes.xs, flex: 1, lineHeight: 16 },

  errorCard: { alignItems: 'center', gap: Spacing.md, padding: Spacing.xxl },
  errorTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary },
  errorSubtext: { color: Colors.textMuted, fontSize: FontSizes.md },

  footerText: { color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: Spacing.md },
});
