import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
  useWindowDimensions, Platform, TextInput, ActivityIndicator, RefreshControl,
  Linking,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import QRCodeModal from '../components/ui/QRCodeModal';
import { useAuth } from '../contexts/AuthContext';
import { urlAPI } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../constants/theme';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [stats, setStats] = useState({ totalUrls: 0, activeUrls: 0, totalClicks: 0, topUrl: null });
  const [recentLinks, setRecentLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick shorten
  const [newUrl, setNewUrl] = useState('');
  const [shortenLoading, setShortenLoading] = useState(false);
  const [shortenResult, setShortenResult] = useState(null);
  const [shortenError, setShortenError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isAuthLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [isAuthenticated, isAuthLoading, navigationState?.key]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, linksRes] = await Promise.all([
        urlAPI.getStats(),
        urlAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
      ]);
      setStats(statsRes.data);
      setRecentLinks(linksRes.data.urls);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleQuickShorten = async () => {
    if (!newUrl.trim()) return;
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setShortenLoading(true);
    setShortenError('');
    setShortenResult(null);
    try {
      const res = await urlAPI.create({ originalUrl: finalUrl });
      setShortenResult(res.data.url);
      setNewUrl('');
      loadData(); // Refresh list
    } catch (err) {
      setShortenError(err.message || 'Failed to shorten URL');
    } finally {
      setShortenLoading(false);
    }
  };

  const handleCopy = async (text, id) => {
    if (Platform.OS === 'web') await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    try {
      await urlAPI.delete(id);
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await urlAPI.update(id, { isActive: !currentStatus });
      loadData();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleShowQR = (link) => {
    setSelectedLink(link);
    setQrModalVisible(true);
  };

  const getDomainFromUrl = (url) => {
    try {
      const { hostname } = new URL(url);
      return hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  const statCards = [
    { label: 'Total Links', value: stats.totalUrls, icon: 'link-outline', color: Colors.primary, bg: 'rgba(124,58,237,0.1)' },
    { label: 'Total Clicks', value: stats.totalClicks, icon: 'bar-chart-outline', color: Colors.accent, bg: 'rgba(59,130,246,0.1)' },
    { label: 'Active Links', value: stats.activeUrls, icon: 'checkmark-circle-outline', color: Colors.success, bg: 'rgba(16,185,129,0.1)' },
    { label: 'Top Clicks', value: stats.topUrl?.clickCount || 0, icon: 'trending-up-outline', color: Colors.warning, bg: 'rgba(245,158,11,0.1)' },
  ];

  if (!isAuthenticated) return null;

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <View>
              <View style={styles.welcomeTitleRow}>
                <Text style={styles.welcomeText}>Welcome back, {user?.name?.split(' ')[0]} 👋</Text>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>Free</Text>
                </View>
              </View>
              <Text style={styles.welcomeSubtext}>Here's how your links are performing</Text>
            </View>
            <Button
              title="View All Links"
              onPress={() => router.push('/links')}
              variant="outline"
              size="sm"
              icon={<Ionicons name="arrow-forward" size={14} color={Colors.primary} />}
              iconPosition="right"
            />
          </View>

          {/* Quick Shorten */}
          <Card variant="glass" style={styles.quickShortenCard}>
            <Text style={styles.quickShortenTitle}>
              <Ionicons name="flash" size={18} color={Colors.warning} /> Quick Shorten
            </Text>
            <View style={[styles.quickShortenRow, isMobile && styles.quickShortenRowMobile]}>
              <TextInput
                value={newUrl}
                onChangeText={(t) => { setNewUrl(t); setShortenError(''); setShortenResult(null); }}
                placeholder="Paste URL to shorten..."
                placeholderTextColor={Colors.textMuted}
                style={[styles.quickInput, isMobile && { marginBottom: Spacing.sm }]}
                onSubmitEditing={handleQuickShorten}
                selectionColor={Colors.primary}
              />
              <Button
                title={shortenLoading ? 'Shrinking...' : 'Shrink'}
                onPress={handleQuickShorten}
                loading={shortenLoading}
                size="sm"
                icon={<Ionicons name="cut-outline" size={16} color="#fff" />}
              />
            </View>
            {shortenError ? <Text style={styles.shortenError}>{shortenError}</Text> : null}
            {shortenResult && (
              <View style={styles.shortenResultRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.shortenResultUrl} numberOfLines={1}>{shortenResult.shortUrl}</Text>
                <TouchableOpacity onPress={() => handleCopy(shortenResult.shortUrl, 'quick')}>
                  <Text style={styles.copyLink}>{copiedId === 'quick' ? '✓ Copied' : 'Copy'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShowQR(shortenResult)} style={styles.qrIconBtn}>
                  <Ionicons name="qr-code-outline" size={16} color={Colors.primaryLight} />
                </TouchableOpacity>
              </View>
            )}
          </Card>



          {/* Stats Grid */}
          <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
            {statCards.map((stat, i) => (
              <Card key={i} variant="glass" style={[styles.statCard, isMobile && styles.statCardMobile]}>
                <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{isLoading ? '—' : stat.value.toLocaleString()}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>

          {/* Content with sidebar ad */}
          <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
            {/* Recent Links */}
            <View style={styles.linksSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Links</Text>
                <TouchableOpacity onPress={() => router.push('/links')}>
                  <Text style={styles.viewAllLink}>View All →</Text>
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : recentLinks.length === 0 ? (
                <Card variant="glass" style={styles.emptyCard}>
                  <Ionicons name="link-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>No links yet</Text>
                  <Text style={styles.emptySubtext}>Shorten your first URL using the form above!</Text>
                </Card>
              ) : (
                recentLinks.map((link) => (
                  <Card key={link.id} variant="glass" style={styles.linkCard}>
                    <View style={styles.linkHeader}>
                      <View style={styles.linkInfo}>
                        <Text style={styles.linkTitle} numberOfLines={1}>
                          {link.title || getDomainFromUrl(link.originalUrl)}
                        </Text>
                        <View style={styles.shortUrlContainer}>
                          <TouchableOpacity 
                            onPress={() => Linking.openURL(link.shortUrl)}
                            style={styles.shortUrlRow}
                          >
                            <Ionicons name="link" size={14} color={Colors.primaryLight} />
                            <Text style={styles.shortUrlText}>{link.shortUrl}</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            onPress={() => handleCopy(link.shortUrl, link.id)}
                            style={styles.inlineCopyBtn}
                          >
                            <Ionicons
                              name={copiedId === link.id ? 'checkmark' : 'copy-outline'}
                              size={14}
                              color={copiedId === link.id ? Colors.success : Colors.textMuted}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.linkActions}>
                        <TouchableOpacity
                          onPress={() => handleToggleActive(link.id, link.isActive)}
                          style={[styles.statusBadge, { backgroundColor: link.isActive ? Colors.successBg : Colors.errorBg }]}
                        >
                          <View style={[styles.statusDot, { backgroundColor: link.isActive ? Colors.success : Colors.error }]} />
                          <Text style={[styles.statusText, { color: link.isActive ? Colors.success : Colors.error }]}>
                            {link.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.linkFooter}>
                      <View style={styles.linkStats}>
                        <View style={styles.clickBadge}>
                          <Ionicons name="analytics-outline" size={14} color={Colors.accent} />
                          <Text style={styles.clickCount}>{link.clickCount} clicks</Text>
                        </View>
                        <Text style={styles.linkDate}>
                          {new Date(link.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.linkActionRow}>
                      <TouchableOpacity onPress={() => handleCopy(link.shortUrl, link.id)} style={styles.actionBtn}>
                        <Ionicons name="copy-outline" size={16} color={Colors.textMuted} />
                        <Text style={styles.actionBtnText}>Copy</Text>
                      </TouchableOpacity>
                       <TouchableOpacity onPress={() => handleShowQR(link)} style={styles.actionBtn}>
                        <Ionicons name="qr-code-outline" size={16} color={Colors.textMuted} />
                        <Text style={styles.actionBtnText}>QR</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(link.id)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                        <Text style={[styles.actionBtnText, { color: Colors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))
              )}
            </View>

            {/* Sidebar */}
            {!isMobile && (
              <View style={styles.sidebar}>
                {/* Top performing link */}
                {stats.topUrl && (
                  <Card variant="glass" style={styles.topUrlCard}>
                    <Text style={styles.topUrlTitle}>🏆 Top Performing</Text>
                    <Text style={styles.topUrlName} numberOfLines={1}>{stats.topUrl.title || stats.topUrl.originalUrl}</Text>
                    <Text style={styles.topUrlClicks}>{stats.topUrl.clickCount} clicks</Text>
                  </Card>
                )}
              </View>
            )}
          </View>


        </Animated.View>

        <Footer />
      </ScrollView>
      
      <QRCodeModal 
        visible={qrModalVisible} 
        onClose={() => setQrModalVisible(false)} 
        link={selectedLink} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { maxWidth: 1200, width: '100%', alignSelf: 'center', padding: Spacing.lg },

  welcomeSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg, flexWrap: 'wrap', gap: Spacing.md,
  },
  welcomeText: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  welcomeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  freeBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  freeBadgeText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  welcomeSubtext: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },

  quickShortenCard: { marginBottom: Spacing.lg },
  quickShortenTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  quickShortenRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  quickShortenRowMobile: { flexDirection: 'column' },
  quickInput: {
    flex: 1, backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderLight, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4, color: Colors.textPrimary, fontSize: FontSizes.md,
  },
  shortenError: { color: Colors.error, fontSize: FontSizes.sm, marginTop: Spacing.xs },
  shortenResultRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.sm + 4, backgroundColor: Colors.successBg,
    borderRadius: BorderRadius.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  shortenResultUrl: { flex: 1, color: Colors.success, fontSize: FontSizes.md, fontWeight: '600' },
  copyLink: { color: Colors.primaryLight, fontWeight: '700', fontSize: FontSizes.sm },

  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  statsGridMobile: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { flex: 1, minWidth: 140, alignItems: 'center', padding: Spacing.lg },
  statCardMobile: { flex: 0, width: '47%', minWidth: 0 },
  statIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.xs, fontWeight: '500' },

  mainContent: { flexDirection: 'row', gap: Spacing.lg },
  mainContentMobile: { flexDirection: 'column' },
  linksSection: { flex: 1 },
  sidebar: { width: 320, gap: Spacing.lg },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  viewAllLink: { color: Colors.primaryLight, fontWeight: '600', fontSize: FontSizes.sm },

  loadingContainer: { padding: Spacing.xxl, alignItems: 'center' },
  emptyCard: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSizes.sm, color: Colors.textMuted },

  linkCard: { marginBottom: Spacing.md },
  linkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  linkInfo: { flex: 1, marginRight: Spacing.md },
  linkTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  shortUrlRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  shortUrlText: { color: Colors.primaryLight, fontSize: FontSizes.sm, fontWeight: '600' },
  shortUrlContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  inlineCopyBtn: { padding: 4 },
  linkActions: {},
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingVertical: 4, paddingHorizontal: Spacing.sm + 2, borderRadius: BorderRadius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.xs, fontWeight: '600' },
  linkFooter: { marginBottom: Spacing.sm },
  linkOriginal: { color: Colors.textMuted, fontSize: FontSizes.xs, marginBottom: Spacing.xs },
  linkStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  clickBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  clickCount: { color: Colors.accent, fontSize: FontSizes.xs, fontWeight: '600' },
  linkDate: { color: Colors.textMuted, fontSize: FontSizes.xs },
  linkActionRow: {
    flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  actionBtnText: { color: Colors.textMuted, fontSize: FontSizes.xs, fontWeight: '600' },
  qrIconBtn: { padding: 4, marginLeft: Spacing.xs },

  topUrlCard: { padding: Spacing.lg },
  topUrlTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  topUrlName: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginBottom: Spacing.xs },
  topUrlClicks: { color: Colors.warning, fontWeight: '700', fontSize: FontSizes.lg },
});
