import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, useWindowDimensions,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SettingsPage() {
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isAuthLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [isAuthenticated, isAuthLoading, navigationState?.key]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateMessage('');
    try {
      // Would call API here
      setUpdateMessage('Profile updated successfully');
    } catch (err) {
      setUpdateMessage('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (!isAuthenticated) return null;

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Manage your account and preferences</Text>

          {/* Profile Card */}
          <Card variant="glass" style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Profile</Text>
            </View>

            <View style={styles.profileInfo}>
              <LinearGradient colors={Colors.gradientPrimary} style={styles.avatarLg}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              </LinearGradient>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.providerBadge}>
                  <Ionicons
                    name={user?.provider === 'google' ? 'logo-google' : user?.provider === 'microsoft' ? 'logo-microsoft' : 'mail-outline'}
                    size={12}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.providerText}>
                    {user?.provider === 'local' ? 'Email' : user?.provider} account
                  </Text>
                </View>
                <View style={styles.tierBadge}>
                  <Ionicons name="gift-outline" size={12} color={Colors.success} />
                  <Text style={styles.tierText}>Free Account</Text>
                </View>
              </View>
            </View>

            <Input
              label="Display Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              icon={<Ionicons name="person-outline" size={20} color={Colors.textMuted} />}
            />

            {updateMessage ? (
              <Text style={[styles.updateMsg, { color: updateMessage.includes('Failed') ? Colors.error : Colors.success }]}>
                {updateMessage}
              </Text>
            ) : null}

            <Button
              title="Save Changes"
              onPress={handleUpdateProfile}
              loading={isUpdating}
              variant="primary"
              size="md"
            />
          </Card>

          {/* Account Card */}
          <Card variant="glass" style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-outline" size={24} color={Colors.accent} />
              <Text style={styles.cardTitle}>Account</Text>
            </View>

            <View style={styles.accountItem}>
              <View>
                <Text style={styles.accountItemTitle}>Email</Text>
                <Text style={styles.accountItemValue}>{user?.email}</Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: user?.isVerified ? Colors.successBg : Colors.warningBg }]}>
                <Text style={{ color: user?.isVerified ? Colors.success : Colors.warning, fontSize: FontSizes.xs, fontWeight: '600' }}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </Text>
              </View>
            </View>

            <View style={styles.accountItem}>
              <View>
                <Text style={styles.accountItemTitle}>Member Since</Text>
                <Text style={styles.accountItemValue}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </Text>
              </View>
            </View>
          </Card>


          {/* Danger Zone */}
          <Card variant="glass" style={[styles.card, styles.dangerCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning-outline" size={24} color={Colors.error} />
              <Text style={[styles.cardTitle, { color: Colors.error }]}>Danger Zone</Text>
            </View>

            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="outline"
              fullWidth
              icon={<Ionicons name="log-out-outline" size={18} color={Colors.primary} />}
              style={{ marginBottom: Spacing.sm }}
            />
            <Button
              title="Delete Account"
              onPress={() => {}}
              variant="outline"
              fullWidth
              icon={<Ionicons name="trash-outline" size={18} color={Colors.error} />}
              textStyle={{ color: Colors.error }}
              style={{ borderColor: Colors.error + '30' }}
            />
          </Card>
        </Animated.View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { maxWidth: 640, width: '100%', alignSelf: 'center', padding: Spacing.lg },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
  pageSubtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.xl },
  card: { marginBottom: Spacing.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { color: Colors.textMuted, fontSize: FontSizes.sm, lineHeight: 20, marginBottom: Spacing.md },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  avatarLg: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FontSizes.xxl, fontWeight: '800' },
  profileDetails: { flex: 1 },
  profileName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  providerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs,
    backgroundColor: Colors.bgTertiary, borderRadius: BorderRadius.full,
    paddingVertical: 2, paddingHorizontal: Spacing.sm, alignSelf: 'flex-start',
  },
  providerText: { color: Colors.textMuted, fontSize: FontSizes.xs, textTransform: 'capitalize' },
  updateMsg: { fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  accountItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  accountItemTitle: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
  accountItemValue: { color: Colors.textPrimary, fontSize: FontSizes.md, marginTop: 2 },
  verifiedBadge: { paddingVertical: 4, paddingHorizontal: Spacing.sm + 2, borderRadius: BorderRadius.full },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs,
    backgroundColor: Colors.successBg, borderRadius: BorderRadius.full,
    paddingVertical: 2, paddingHorizontal: Spacing.sm, alignSelf: 'flex-start',
  },
  tierText: { color: Colors.success, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  adInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.sm },
  adInfoText: { color: Colors.textMuted, fontSize: FontSizes.xs, flex: 1, lineHeight: 18 },
  dangerCard: { borderColor: Colors.error + '20' },
});
