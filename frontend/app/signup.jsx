import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
  useWindowDimensions, Platform, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { GOOGLE_OAUTH_URL, MICROSOFT_OAUTH_URL } from '../constants/config';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../constants/theme';

export default function SignupPage() {
  const { signup, isAuthenticated, error: authError, clearError } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) e.password = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(password)) e.password = 'Must contain a number';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setIsLoading(true);
    clearError();
    const result = await signup(name.trim(), email.trim(), password);
    setIsLoading(false);
    if (result.success) router.replace('/dashboard');
  };

  const handleSocialLogin = (provider) => {
    const url = provider === 'google' ? GOOGLE_OAUTH_URL : MICROSOFT_OAUTH_URL;
    if (Platform.OS === 'web') window.location.href = url;
    else Linking.openURL(url);
  };

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: Colors.textMuted };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score <= 1) return { level: score, label: 'Weak', color: Colors.error };
    if (score <= 2) return { level: score, label: 'Fair', color: Colors.warning };
    if (score <= 3) return { level: score, label: 'Good', color: Colors.accent };
    return { level: score, label: 'Strong', color: Colors.success };
  };

  const strength = getPasswordStrength();

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <View style={styles.cardHeader}>
                <LinearGradient colors={Colors.gradientAccent} style={styles.headerIcon}>
                  <Ionicons name="person-add-outline" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start shortening links and earning today</Text>
              </View>

              {authError && (
                <View style={styles.alertError}>
                  <Ionicons name="alert-circle" size={18} color={Colors.error} />
                  <Text style={styles.alertText}>{authError}</Text>
                </View>
              )}

              {/* Social */}
              <View style={styles.socialButtons}>
                <TouchableOpacity onPress={() => handleSocialLogin('google')} style={styles.socialBtn} activeOpacity={0.7}>
                  <View style={[styles.socialIconCircle, { backgroundColor: Colors.google + '15' }]}>
                    <Ionicons name="logo-google" size={20} color={Colors.google} />
                  </View>
                  <Text style={styles.socialBtnText}>Sign up with Google</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSocialLogin('microsoft')} style={styles.socialBtn} activeOpacity={0.7}>
                  <View style={[styles.socialIconCircle, { backgroundColor: Colors.microsoft + '15' }]}>
                    <Ionicons name="logo-microsoft" size={20} color={Colors.microsoft} />
                  </View>
                  <Text style={styles.socialBtnText}>Sign up with Microsoft</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or use email</Text>
                <View style={styles.dividerLine} />
              </View>

              <Input
                label="Full Name"
                value={name}
                onChangeText={(t) => { setName(t); setErrors({}); clearError(); }}
                placeholder="John Doe"
                error={errors.name}
                icon={<Ionicons name="person-outline" size={20} color={Colors.textMuted} />}
              />

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
                placeholder="Min. 8 characters"
                error={errors.password}
                secureTextEntry={!showPassword}
                icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                }
              />

              {/* Password Strength */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= strength.level ? strength.color : Colors.bgTertiary },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setErrors({}); }}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                secureTextEntry={!showPassword}
                icon={<Ionicons name="shield-checkmark-outline" size={20} color={Colors.textMuted} />}
              />

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={isLoading}
                fullWidth
                size="lg"
                icon={<Ionicons name="rocket-outline" size={18} color="#fff" />}
                style={{ marginTop: Spacing.sm }}
              />

              <Text style={styles.terms}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.switchLink}>Sign In</Text>
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
  background: { flex: 1, minHeight: '100%', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg, position: 'relative', overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 9999, opacity: 0.12 },
  orbPurple: { width: 350, height: 350, backgroundColor: Colors.primary, top: -80, left: -80 },
  orbBlue: { width: 250, height: 250, backgroundColor: Colors.accent, bottom: -60, right: -60 },
  container: { maxWidth: 480, width: '100%', alignSelf: 'center' },
  containerMobile: { maxWidth: '100%' },
  card: {
    backgroundColor: Colors.glass, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.glassBorder, padding: Spacing.xl + 8, ...Shadows.lg,
  },
  cardMobile: { padding: Spacing.lg },
  cardHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  headerIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs + 2, textAlign: 'center' },
  alertError: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.errorBg, borderRadius: BorderRadius.sm,
    padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.error + '20',
  },
  alertText: { color: Colors.error, fontSize: FontSizes.sm, flex: 1 },
  socialButtons: { gap: Spacing.sm + 4, marginBottom: Spacing.lg },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 4,
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderLight, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  socialIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  socialBtnText: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { color: Colors.textMuted, fontSize: FontSizes.xs, textTransform: 'uppercase', letterSpacing: 1 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: -Spacing.sm, marginBottom: Spacing.md },
  strengthBars: { flexDirection: 'row', gap: 3, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: FontSizes.xs, fontWeight: '600' },
  terms: { color: Colors.textMuted, fontSize: FontSizes.xs, textAlign: 'center', marginTop: Spacing.md, lineHeight: 18 },
  termsLink: { color: Colors.primaryLight, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  switchText: { color: Colors.textMuted, fontSize: FontSizes.sm },
  switchLink: { color: Colors.primaryLight, fontSize: FontSizes.sm, fontWeight: '700' },
});
