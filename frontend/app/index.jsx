import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { urlAPI } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../constants/theme';
import { TOOLS_CATEGORIES } from '../constants/tools';


export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for CTA
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleShrink = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setIsLoading(true);
    setError('');
    setShortenedUrl('');

    try {
      const response = await urlAPI.create({ originalUrl: finalUrl });
      setShortenedUrl(response.data.url.shortUrl);
      Animated.spring(resultAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(shortenedUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: 'analytics-outline',
      title: 'Powerful Analytics',
      desc: 'Track clicks, devices, browsers, and geographic data in real-time.',
      color: Colors.accent,
    },
    {
      icon: 'flash-outline',
      title: 'Lightning Fast',
      desc: 'Instant redirects with global CDN. Your links never slow down.',
      color: Colors.success,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Secure & Reliable',
      desc: '99.9% uptime with enterprise-grade security for your links.',
      color: Colors.primary,
    },
    {
      icon: 'qr-code-outline',
      title: 'QR Codes',
      desc: 'Generate beautiful QR codes for every shortened link instantly.',
      color: '#EC4899',
    },
    {
      icon: 'globe-outline',
      title: 'Custom Domains',
      desc: 'Use your own domain for branded short links and full control.',
      color: '#14B8A6',
    },
  ];

  const stats = [
    { value: '10M+', label: 'Links Shortened' },
    { value: '5M+', label: 'Images Processed' },
    { value: '150K+', label: 'Happy Users' },
    { value: '99.9%', label: 'Uptime' },
  ];


  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={Colors.gradientHero}
          style={styles.heroSection}
        >
          {/* Decorative orbs */}
          <View style={[styles.orb, styles.orbPurple]} />
          <View style={[styles.orb, styles.orbBlue]} />

          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              isMobile && styles.heroContentMobile,
            ]}
          >
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>Unified Link & Image Workspace</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Your All-in-One{'\n'}
              <Text style={styles.heroTitleGradient}>Digital Toolbox</Text>
            </Text>

            <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
              Shrink links with deep analytics, isolate subjects with High-Fidelity AI, 
              and master 13+ free image tools. Everything you need to manage your digital assets.
            </Text>


            {/* Primary Action: URL Shortener */}
            {!shortenedUrl && !error && (
              <View style={[styles.mainActionContainer, isMobile && styles.mainActionContainerMobile]}>
                <View style={[styles.urlInputContainer, isMobile && styles.urlInputContainerMobile]}>
                  <View style={[styles.urlInputWrapper, isMobile && styles.urlInputWrapperMobile]}>
                    <Ionicons name="link-outline" size={22} color={Colors.textMuted} style={styles.urlIcon} />
                    <TextInput
                      value={url}
                      onChangeText={(text) => { setUrl(text); setError(''); }}
                      placeholder="Paste your long link to shrink..."
                      placeholderTextColor={Colors.textMuted}
                      style={[styles.urlInput, isMobile && styles.urlInputMobile]}
                      onSubmitEditing={handleShrink}
                    />
                    {!isMobile && (
                      <TouchableOpacity onPress={handleShrink} disabled={isLoading}>
                        <LinearGradient
                          colors={Colors.gradientPrimary}
                          style={styles.shrinkButton}
                        >
                          <Text style={styles.shrinkButtonText}>{isLoading ? '...' : 'Shrink Now'}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isMobile && (
                    <Button
                      title={isLoading ? 'Shrinking...' : 'Shrink It!'}
                      onPress={handleShrink}
                      loading={isLoading}
                      fullWidth
                      style={{ marginTop: Spacing.sm }}
                    />
                  )}
                </View>

                {/* Primary Tools Grid */}
                <View style={[styles.primaryToolsGrid, isMobile && styles.primaryToolsGridMobile]}>
                  <TouchableOpacity 
                    onPress={() => router.push('/tools/remove-background')}
                    style={[styles.primaryToolCard, isMobile && styles.primaryToolCardMobile]}
                  >
                    <Card variant="glass" style={styles.primaryToolInner}>
                      <View style={styles.badgePro}>
                        <Text style={styles.badgeProText}>High Fidelity</Text>
                      </View>
                      <View style={[styles.primaryToolIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                        <Ionicons name="cut" size={32} color="#8B5CF6" />
                      </View>
                      <View>
                        <Text style={styles.primaryToolTitle}>Remove Background</Text>
                        <Text style={styles.primaryToolDesc}>AI-powered subject isolation</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => router.push('/tools/compress')}
                    style={[styles.primaryToolCard, isMobile && styles.primaryToolCardMobile]}
                  >
                    <Card variant="glass" style={styles.primaryToolInner}>
                      <View style={[styles.primaryToolIcon, { backgroundColor: '#EC4899' + '20' }]}>
                        <Ionicons name="contract" size={32} color="#EC4899" />
                      </View>
                      <View>
                        <Text style={styles.primaryToolTitle}>Compress Image</Text>
                        <Text style={styles.primaryToolDesc}>Keep quality, reduce size</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </View>
              </View>
            )}



            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Shortened URL Result */}
            {shortenedUrl ? (
              <Animated.View
                style={[
                  styles.resultContainer,
                  {
                    opacity: resultAnim,
                    transform: [
                      {
                        translateY: resultAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.resultContent}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.resultUrl} numberOfLines={1}>{shortenedUrl}</Text>
                  <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                    <LinearGradient
                      colors={copied ? [Colors.success, Colors.success] : Colors.gradientPrimary}
                      style={styles.copyButtonInner}
                    >
                      <Ionicons
                        name={copied ? 'checkmark' : 'copy-outline'}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.copyButtonText}>
                        {copied ? 'Copied!' : 'Copy'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : null}

            {!isAuthenticated && (
              <Text style={styles.heroHint}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                {'  '}Sign in to start shortening URLs and access your dashboard
              </Text>
            )}
          </Animated.View>
        </LinearGradient>



        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
            {stats.map((stat, index) => (
              <View key={index} style={[styles.statItem, isMobile && styles.statItemMobile]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Everything You Need to{' '}
            <Text style={styles.sectionTitleAccent}>Succeed</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Powerful tools to shorten and track your links
          </Text>

          <View style={[styles.featuresGrid, isMobile && styles.featuresGridMobile]}>
            {[
              {
                icon: 'flash-outline',
                title: 'Blazing Speed',
                desc: 'Instant URL redirects and lightning-fast in-browser image processing.',
                color: Colors.success,
              },
              {
                icon: 'cut-outline',
                title: 'Pro AI Tools',
                desc: 'Remove backgrounds and upscale images with industry-leading precision.',
                color: Colors.primary,
              },
              {
                icon: 'analytics-outline',
                title: 'Deep Analytics',
                desc: 'Track every click and asset interaction with real-time geographic data.',
                color: Colors.accent,
              },
              {
                icon: 'shield-checkmark-outline',
                title: 'Privacy First',
                desc: 'Your images never leave your browser for most tools. 100% secure.',
                color: '#14B8A6',
              },
            ].map((feature, index) => (
              <Card key={index} variant="glass" style={[styles.featureCard, isMobile && styles.featureCardMobile]}>
                <View style={[styles.featureIconBg, { backgroundColor: feature.color + '15' }]}>
                  <Ionicons name={feature.icon} size={28} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </Card>
            ))}
          </View>

        </View>

        {/* Product Catalog Section */}
        <View style={styles.catalogSection}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Professional <Text style={styles.sectionTitleAccent}>Product Suite</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            13 Free Image Tools & Powerful Link Management
          </Text>

          {TOOLS_CATEGORIES.map((cat, idx) => (
            <View key={idx} style={[styles.catalogCategory, isMobile && styles.catalogCategoryMobile]}>
              <View style={styles.categoryLabelContainer}>
                <Text style={styles.categoryLabel}>{cat.category}</Text>
                <View style={styles.categoryLine} />
              </View>
              <View style={[styles.catalogGrid, isMobile && styles.catalogGridMobile]}>
                {cat.items.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => router.push(item.route)}
                    style={[styles.catalogItem, isMobile && styles.catalogItemMobile]}
                  >
                    <Card variant="glass" style={styles.catalogCard}>
                      <View style={[styles.catalogIcon, { backgroundColor: item.color + '15' }]}>
                        <Ionicons name={item.icon} size={22} color={item.color} />
                      </View>
                      <View style={styles.catalogText}>
                        <Text style={styles.catalogItemTitle}>{item.title}</Text>
                        <Text style={styles.catalogItemDesc} numberOfLines={1}>{item.desc}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>


        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Frequently Asked <Text style={styles.sectionTitleAccent}>Questions</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Find answers to common questions about ShrinQE and our services
          </Text>

          <View style={styles.faqGrid}>
            {[
              {
                q: 'Are my images stored on your servers?',
                a: 'Most of our image tools process files directly in your browser. For AI tools like Background Removal, we use secure, transient processing that deletes your data immediately after completion.',
              },
              {
                q: 'Are shortened links permanent?',
                a: 'Yes, your shortened links will remain active as long as they comply with our safety guidelines. You can track their performance forever in your dashboard.',
              },
              {
                q: 'Do I need an account to use the tools?',
                a: 'You can use all image tools for free without an account. URL shortening with analytics requires a quick sign-up to save your data.',
              },
            ].map((faq, index) => (
              <Card key={index} variant="glass" style={styles.faqCard}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </Card>
            ))}
          </View>

        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.1)', 'rgba(59, 130, 246, 0.05)', 'transparent']}
          style={styles.ctaSection}
        >
          <Text style={[styles.ctaTitle, isMobile && styles.ctaTitleMobile]}>
            Master Your Digital Assets
          </Text>
          <Text style={styles.ctaSubtitle}>
            Join 150K+ users who trust ShrinQE for link management and image processing.
          </Text>
          <Button
            title="Start Using ShrinQE — It's Free"
            onPress={() => router.push(isAuthenticated ? '/dashboard' : '/signup')}
            size="lg"
            icon={<Ionicons name="rocket-outline" size={20} color="#fff" />}
          />

        </LinearGradient>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  heroSection: {
    paddingTop: Spacing.xxxl + 20,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  orbPurple: {
    width: 400,
    height: 400,
    backgroundColor: Colors.primary,
    top: -100,
    right: -100,
  },
  orbBlue: {
    width: 300,
    height: 300,
    backgroundColor: Colors.accent,
    bottom: -50,
    left: -50,
  },
  heroContent: {
    maxWidth: 800,
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
  },
  heroContentMobile: {
    paddingHorizontal: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    color: Colors.primaryLight,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: FontSizes.display,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 68,
    letterSpacing: -1.5,
    marginBottom: Spacing.lg,
  },
  heroTitleMobile: {
    fontSize: FontSizes.xxxl,
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroTitleGradient: {
    color: Colors.primaryLight,
  },
  heroSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.xl + 8,
    maxWidth: 600,
  },
  heroSubtitleMobile: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },

  // URL Input
  urlInputContainer: {
    width: '100%',
  },

  urlInputContainerMobile: {
    maxWidth: '100%',
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    ...Shadows.lg,
  },
  urlInputWrapperMobile: {
    paddingRight: Spacing.md,
  },
  urlIcon: {
    marginRight: Spacing.sm,
  },
  urlInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.md,
    fontWeight: '500',
    outlineStyle: 'none',
  },
  urlInputMobile: {
    fontSize: FontSizes.md,
  },
  shrinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  shrinkButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm + 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
  },
  heroHint: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },

  // Result
  resultContainer: {
    width: '100%',
    maxWidth: 680,
    marginTop: Spacing.md,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    padding: Spacing.md,
    gap: Spacing.sm + 4,
  },
  resultUrl: {
    flex: 1,
    color: Colors.success,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  copyButton: {},
  copyButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Unified Product Suite
  mainActionContainer: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xl,
  },
  mainActionContainerMobile: {
    gap: Spacing.lg,
  },
  primaryToolsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.lg,
    justifyContent: 'center',
  },
  primaryToolsGridMobile: {
    flexDirection: 'column',
  },
  primaryToolCard: {
    flex: 1,
  },
  primaryToolCardMobile: {
    width: '100%',
  },
  primaryToolInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
  },
  primaryToolIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryToolTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '800',
    marginBottom: 2,
  },
  primaryToolDesc: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  badgePro: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  badgeProText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },


  // Product Catalog Section
  catalogSection: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
  },
  catalogCategory: {
    width: '100%',
    maxWidth: 1100,
    marginTop: Spacing.xl,
  },
  catalogCategoryMobile: {
    marginTop: Spacing.lg,
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  categoryLabel: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  categoryLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'flex-start',
  },
  catalogGridMobile: {
    gap: Spacing.sm,
  },
  catalogItem: {
    width: '23.5%', // 4 columns
    minHeight: 100,
  },
  catalogItemMobile: {
    width: '48%', // 2 columns
  },
  catalogCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    minHeight: 80,
  },
  catalogIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogText: {
    flex: 1,
    gap: 2,
  },
  catalogItemTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  catalogItemDesc: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },


  // Stats
  statsSection: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  statsGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemMobile: {
    width: '45%',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  statValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },

  // Features
  featuresSection: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm + 4,
    letterSpacing: -0.5,
  },
  sectionTitleMobile: {
    fontSize: FontSizes.xxl,
  },
  sectionTitleAccent: {
    color: Colors.primaryLight,
  },
  sectionSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
    maxWidth: 1100,
    width: '100%',
  },
  featuresGridMobile: {
    gap: Spacing.md,
  },
  featureCard: {
    width: 320,
    minHeight: 180,
  },
  featureCardMobile: {
    width: '100%',
    minHeight: 140,
  },
  featureIconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
  },
  featureDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  // CTA
  ctaSection: {
    paddingVertical: Spacing.xxxl + 20,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  ctaTitleMobile: {
    fontSize: FontSizes.xxl,
  },
  ctaSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 500,
  },
  
  // FAQ
  faqSection: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
  },
  faqGrid: {
    width: '100%',
    maxWidth: 900,
    gap: Spacing.md,
  },
  faqCard: {
    width: '100%',
    padding: Spacing.lg,
  },
  faqQuestion: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  faqAnswer: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    lineHeight: 22,
  },

  catalogItemDesc: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },
});
