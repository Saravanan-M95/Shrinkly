import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
  useWindowDimensions, Platform, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { GOOGLE_OAUTH_URL } from '../constants/config';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../constants/theme';

export default function LoginPage() {
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    clearError();
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      router.replace('/dashboard');
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider !== 'google') return;
    const url = GOOGLE_OAUTH_URL;
    if (Platform.OS === 'web') {
      window.location.href = url;
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={Colors.gradientHero} style={styles.background}>
          <View style={[styles.orb, styles.orbPurple]} />
          <View style={[styles.orb, styles.orbBlue]} />

          <Animated.View
            style={[
              styles.container,
              isMobile && styles.containerMobile,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={[styles.card, isMobile && styles.cardMobile]}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <LinearGradient colors={Colors.gradientPrimary} style={styles.headerIcon}>
                  <Ionicons name="log-in-outline" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to manage your links and analytics
                </Text>
              </View>

              {/* OAuth error from redirect */}
              {params.error && (
                <View style={styles.alertError}>
                  <Ionicons name="alert-circle" size={18} color={Colors.error} />
                  <Text style={styles.alertText}>
                    {params.error === 'google_failed' ? 'Google sign-in failed' :
                     'Sign-in failed. Please try again.'}
                  </Text>
                </View>
              )}

              {/* Auth error */}
              {authError && (
                <View style={styles.alertError}>
                  <Ionicons name="alert-circle" size={18} color={Colors.error} />
                  <Text style={styles.alertText}>{authError}</Text>
                </View>
              )}

              {/* Social Login */}
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  onPress={() => handleSocialLogin('google')}
                  style={styles.socialBtn}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: Colors.google + '15' }]}>
                    <Ionicons name="logo-google" size={20} color={Colors.google} />
                  </View>
                  <Text style={styles.socialBtnText}>Continue with Google</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with email</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <Input
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors({}); clearError(); }}
                placeholder="you@example.com"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Ionicons name="mail-outline" size={20} color={Colors.textMuted} />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors({}); clearError(); }}
                placeholder="Enter your password"
                error={errors.password}
                secureTextEntry={!showPassword}
                icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity 
                style={styles.forgotLink}
                onPress={() => router.push('/auth/forgot-password')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
                style={{ marginTop: Spacing.md }}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.switchLink}>Sign Up Free</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  background: { flex: 1, minHeight: '100%', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg, position: 'relative', overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 9999, opacity: 0.12 },
  orbPurple: { width: 350, height: 350, backgroundColor: Colors.primary, top: -80, right: -80 },
  orbBlue: { width: 250, height: 250, backgroundColor: Colors.accent, bottom: -60, left: -60 },
  container: { maxWidth: 480, width: '100%', alignSelf: 'center' },
  containerMobile: { maxWidth: '100%' },
  card: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.xl + 8,
    ...Shadows.lg,
  },
  cardMobile: { padding: Spacing.lg },
  cardHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  headerIcon: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs + 2, textAlign: 'center' },
  alertError: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.errorBg, borderRadius: BorderRadius.sm,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.error + '20',
  },
  alertText: { color: Colors.error, fontSize: FontSizes.sm, flex: 1 },
  socialButtons: { gap: Spacing.sm + 4, marginBottom: Spacing.lg },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 4,
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderLight,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  socialIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  socialBtnText: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { color: Colors.textMuted, fontSize: FontSizes.xs, textTransform: 'uppercase', letterSpacing: 1 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -Spacing.sm },
  forgotText: { color: Colors.primaryLight, fontSize: FontSizes.sm, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg + 4 },
  switchText: { color: Colors.textMuted, fontSize: FontSizes.sm },
  switchLink: { color: Colors.primaryLight, fontSize: FontSizes.sm, fontWeight: '700' },
});
