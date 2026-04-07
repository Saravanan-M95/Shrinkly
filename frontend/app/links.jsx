import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
  useWindowDimensions, Platform, TextInput, ActivityIndicator, RefreshControl,
  Linking,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import AdBanner from '../components/ui/AdBanner';
import QRCodeModal from '../components/ui/QRCodeModal';
import { useAuth } from '../contexts/AuthContext';
import { urlAPI } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function LinksPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isAuthLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [isAuthenticated, isAuthLoading, navigationState?.key]);

  useEffect(() => {
    if (isAuthenticated) loadLinks();
  }, [page, isAuthenticated]);

  const loadLinks = async () => {
    try {
      setIsLoading(true);
      const res = await urlAPI.getAll({ page, limit: 10, search, sortBy: 'createdAt', sortOrder: 'DESC' });
      setLinks(res.data.urls);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  }, [search]);

  const handleSearch = () => {
    setPage(1);
    loadLinks();
  };

  const handleCopy = async (text, id) => {
    if (Platform.OS === 'web') await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    try {
      await urlAPI.delete(id);
      loadLinks();
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (id, active) => {
    try {
      await urlAPI.update(id, { isActive: !active });
      loadLinks();
    } catch (err) { console.error(err); }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!analytics[id]) {
      try {
        const res = await urlAPI.getAnalytics(id, { days: 7 });
        setAnalytics((prev) => ({ ...prev, [id]: res.data }));
      } catch (err) { console.error(err); }
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
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>My Links</Text>
              <Text style={styles.pageSubtitle}>{pagination.total} total links</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/dashboard')}>
              <View style={styles.backBtn}>
                <Ionicons name="arrow-back" size={18} color={Colors.textSecondary} />
                <Text style={styles.backBtnText}>Dashboard</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={[styles.searchRow, isMobile && styles.searchRowMobile]}>
            <View style={[styles.searchInput, isMobile && { marginBottom: Spacing.sm }]}>
              <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search links..."
                placeholderTextColor={Colors.textMuted}
                style={styles.searchTextInput}
                onSubmitEditing={handleSearch}
                selectionColor={Colors.primary}
              />
              {search ? (
                <TouchableOpacity onPress={() => { setSearch(''); setPage(1); setTimeout(loadLinks, 100); }}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Ad */}
          <AdBanner size="leaderboard" />

          {/* Links List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading links...</Text>
            </View>
          ) : links.length === 0 ? (
            <Card variant="glass" style={styles.emptyCard}>
              <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {search ? 'No links match your search' : 'No links yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {search ? 'Try a different search term' : 'Start by shortening a URL from the dashboard'}
              </Text>
            </Card>
          ) : (
            links.map((link) => (
              <Card key={link.id} variant="glass" style={styles.linkCard}>
                <TouchableOpacity onPress={() => toggleExpand(link.id)} activeOpacity={0.8}>
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
                    <View style={styles.linkMeta}>
                      <TouchableOpacity
                        onPress={() => handleToggle(link.id, link.isActive)}
                        style={[styles.statusBadge, { backgroundColor: link.isActive ? Colors.successBg : Colors.errorBg }]}
                      >
                        <View style={[styles.statusDot, { backgroundColor: link.isActive ? Colors.success : Colors.error }]} />
                        <Text style={[styles.statusText, { color: link.isActive ? Colors.success : Colors.error }]}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.clickBadge}>
                        <Ionicons name="analytics-outline" size={14} color={Colors.accent} />
                        <Text style={styles.clickCount}>{link.clickCount}</Text>
                      </View>
                      <Ionicons
                        name={expandedId === link.id ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textMuted}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded Analytics */}
                {expandedId === link.id && (
                  <View style={styles.expandedSection}>
                    <View style={styles.expandedDivider} />
                    
                    <View style={styles.originalUrlContainer}>
                      <Text style={styles.originalUrlLabel}>Original URL</Text>
                      <Text style={styles.linkOriginalExpanded}>{link.originalUrl}</Text>
                    </View>

                    {analytics[link.id] ? (
                      <View style={styles.analyticsContent}>
                        <View style={styles.analyticsRow}>
                          <View style={styles.analyticItem}>
                            <Text style={styles.analyticLabel}>Total Clicks</Text>
                            <Text style={styles.analyticValue}>{analytics[link.id].totalClicks}</Text>
                          </View>
                          <View style={styles.analyticItem}>
                            <Text style={styles.analyticLabel}>Last 7 Days</Text>
                            <Text style={styles.analyticValue}>{analytics[link.id].clicksInPeriod}</Text>
                          </View>
                          <View style={styles.analyticItem}>
                            <Text style={styles.analyticLabel}>Created</Text>
                            <Text style={styles.analyticValue}>{new Date(link.createdAt).toLocaleDateString()}</Text>
                          </View>
                        </View>

                        {/* Simple bar chart for daily clicks */}
                        {analytics[link.id].dailyClicks?.length > 0 && (
                          <View style={styles.chartSection}>
                            <Text style={styles.chartTitle}>Daily Clicks (Last 7 Days)</Text>
                            <View style={styles.barChart}>
                              {analytics[link.id].dailyClicks.slice(-7).map((day, i) => {
                                const max = Math.max(...analytics[link.id].dailyClicks.map((d) => d.count), 1);
                                const height = (day.count / max) * 60;
                                return (
                                  <View key={i} style={styles.barContainer}>
                                    <Text style={styles.barValue}>{day.count}</Text>
                                    <View style={[styles.bar, { height: Math.max(height, 4), backgroundColor: Colors.primary }]} />
                                    <Text style={styles.barLabel}>{day.date.slice(5)}</Text>
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        )}

                        {/* Device breakdown */}
                        {analytics[link.id].deviceStats?.length > 0 && (
                          <View style={styles.breakdownSection}>
                            <Text style={styles.chartTitle}>Devices</Text>
                            <View style={styles.breakdownGrid}>
                              {analytics[link.id].deviceStats.map((d, i) => (
                                <View key={i} style={styles.breakdownItem}>
                                  <Text style={styles.breakdownLabel}>{d.device}</Text>
                                  <Text style={styles.breakdownValue}>{d.count}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    ) : (
                      <ActivityIndicator color={Colors.primary} />
                    )}

                    <View style={styles.linkActionRow}>
                      <TouchableOpacity onPress={() => handleCopy(link.shortUrl, link.id)} style={styles.actionBtn}>
                        <Ionicons name="copy-outline" size={16} color={Colors.textMuted} />
                        <Text style={styles.actionBtnText}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleShowQR(link)} style={styles.actionBtn}>
                        <Ionicons name="qr-code-outline" size={16} color={Colors.textMuted} />
                        <Text style={styles.actionBtnText}>QR Code</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(link.id)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                        <Text style={[styles.actionBtnText, { color: Colors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Card>
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
              >
                <Ionicons name="chevron-back" size={18} color={page === 1 ? Colors.textMuted : Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.pageInfo}>Page {page} of {pagination.totalPages}</Text>
              <TouchableOpacity
                onPress={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                style={[styles.pageBtn, page === pagination.totalPages && styles.pageBtnDisabled]}
              >
                <Ionicons name="chevron-forward" size={18} color={page === pagination.totalPages ? Colors.textMuted : Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          <AdBanner size="leaderboard" />
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
  content: { maxWidth: 900, width: '100%', alignSelf: 'center', padding: Spacing.lg },

  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, flexWrap: 'wrap', gap: Spacing.md },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  backBtnText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },

  searchRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  searchRowMobile: { flexDirection: 'column' },
  searchInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderLight, paddingHorizontal: Spacing.md,
  },
  searchTextInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSizes.md, paddingVertical: Spacing.sm + 4 },
  searchBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 4, justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },

  loadingContainer: { padding: Spacing.xxl, alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSizes.sm },
  emptyCard: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },

  linkCard: { marginBottom: Spacing.md, padding: Spacing.md },
  linkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkInfo: { flex: 1, marginRight: Spacing.md },
  linkTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  shortUrlRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  shortUrlText: { color: Colors.primaryLight, fontSize: FontSizes.sm, fontWeight: '600' },
  shortUrlContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  inlineCopyBtn: { padding: 4 },
  linkOriginal: { color: Colors.textMuted, fontSize: FontSizes.xs },
  
  originalUrlContainer: { marginBottom: Spacing.md },
  originalUrlLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  linkOriginalExpanded: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  linkMeta: { alignItems: 'flex-end', gap: Spacing.sm },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingVertical: 4, paddingHorizontal: Spacing.sm + 2, borderRadius: BorderRadius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.xs, fontWeight: '600' },
  clickBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  clickCount: { color: Colors.accent, fontSize: FontSizes.sm, fontWeight: '700' },

  expandedSection: { marginTop: Spacing.md },
  expandedDivider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: Spacing.md },
  analyticsContent: { gap: Spacing.md },
  analyticsRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  analyticItem: {
    flex: 1, minWidth: 100, backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.sm, padding: Spacing.md, alignItems: 'center',
  },
  analyticLabel: { color: Colors.textMuted, fontSize: FontSizes.xs, fontWeight: '600', marginBottom: Spacing.xs },
  analyticValue: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '800' },

  chartSection: { marginTop: Spacing.sm },
  chartTitle: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '700', marginBottom: Spacing.sm },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100, gap: Spacing.xs },
  barContainer: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  barValue: { color: Colors.textMuted, fontSize: 10, marginBottom: 2 },
  bar: { width: '60%', borderRadius: 3, minWidth: 8 },
  barLabel: { color: Colors.textMuted, fontSize: 9, marginTop: 4 },

  breakdownSection: { marginTop: Spacing.sm },
  breakdownGrid: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  breakdownItem: {
    backgroundColor: Colors.bgTertiary, borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  breakdownLabel: { color: Colors.textSecondary, fontSize: FontSizes.xs, textTransform: 'capitalize' },
  breakdownValue: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.sm },

  linkActionRow: {
    flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: Spacing.md,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  actionBtnText: { color: Colors.textMuted, fontSize: FontSizes.xs, fontWeight: '600' },

  paginationRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: Spacing.lg, marginVertical: Spacing.lg,
  },
  pageBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
});
