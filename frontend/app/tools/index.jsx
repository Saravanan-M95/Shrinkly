import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

import { TOOLS_CATEGORIES } from '../../constants/tools';


export default function ToolsHub() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={Colors.gradientHero}
          style={styles.heroSection}
        >
          <View style={[styles.orb, styles.orbPurple]} />
          <View style={[styles.orb, styles.orbBlue]} />

          <Animated.View
            style={[
              styles.heroContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.badge}>
              <Ionicons name="images-outline" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>13 Free Image Tools</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Image Tools{'\n'}
              <Text style={styles.heroTitleGradient}>All-in-One Suite</Text>
            </Text>

            <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
              Compress, resize, convert, edit, and transform your images — 100% free,
              100% private. Your images never leave your browser.
            </Text>

            <View style={styles.privacyBadge}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
              <Text style={styles.privacyText}>All processing happens locally in your browser</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Tools Grid */}
        <View style={styles.toolsSection}>
          {TOOLS_CATEGORIES.map((category, catIdx) => (

            <View key={catIdx} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLine} />
                <Text style={styles.categoryTitle}>{category.category}</Text>
                <View style={styles.categoryLine} />
              </View>

              <View style={[styles.toolsGrid, isMobile && styles.toolsGridMobile]}>
                {category.items.map((tool) => (
                  <TouchableOpacity
                    key={tool.id}
                    onPress={() => router.push(tool.route)}
                    activeOpacity={0.85}
                    style={[styles.toolCardTouch, isMobile && styles.toolCardTouchMobile]}
                  >
                    <Card variant="glass" style={styles.toolCard}>
                      <View style={[styles.toolIconBg, { backgroundColor: tool.color + '15' }]}>
                        <Ionicons name={tool.icon} size={28} color={tool.color} />
                      </View>
                      <Text style={styles.toolTitle}>{tool.title}</Text>
                      <Text style={styles.toolDesc}>{tool.desc}</Text>
                      <View style={styles.toolArrow}>
                        <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.1)', 'rgba(59, 130, 246, 0.05)', 'transparent']}
          style={styles.ctaSection}
        >
          <Text style={[styles.ctaTitle, isMobile && styles.ctaTitleMobile]}>
            Need to Shorten URLs Too?
          </Text>
          <Text style={styles.ctaSubtitle}>
            ShrinQE also offers a powerful URL shortener with analytics, QR codes, and more.
          </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Ionicons name="link-outline" size={18} color="#fff" />
              <Text style={styles.ctaButtonText}>Go to URL Shortener</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  heroSection: {
    paddingTop: Spacing.xxxl + 10,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 9999, opacity: 0.12 },
  orbPurple: { width: 350, height: 350, backgroundColor: Colors.primary, top: -80, right: -80 },
  orbBlue: { width: 250, height: 250, backgroundColor: Colors.accent, bottom: -50, left: -50 },
  heroContent: { maxWidth: 700, alignSelf: 'center', alignItems: 'center', width: '100%' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.1)', borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: BorderRadius.full, paddingVertical: 6, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
  },
  badgeText: { color: Colors.primaryLight, fontSize: FontSizes.sm, fontWeight: '600' },
  heroTitle: {
    fontSize: FontSizes.display, fontWeight: '900', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 64, letterSpacing: -1.5, marginBottom: Spacing.md,
  },
  heroTitleMobile: { fontSize: FontSizes.xxxl, lineHeight: 44, letterSpacing: -1 },
  heroTitleGradient: { color: Colors.primaryLight },
  heroSubtitle: {
    fontSize: FontSizes.lg, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 28, maxWidth: 550, marginBottom: Spacing.lg,
  },
  heroSubtitleMobile: { fontSize: FontSizes.md, lineHeight: 24 },
  privacyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.successBg, borderRadius: BorderRadius.full,
    paddingVertical: 8, paddingHorizontal: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  privacyText: { color: Colors.success, fontSize: FontSizes.sm, fontWeight: '600' },

  toolsSection: { paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg, gap: Spacing.xxl },
  categorySection: { gap: Spacing.lg },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    maxWidth: 1100, alignSelf: 'center', width: '100%',
  },
  categoryLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  categoryTitle: {
    fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  toolsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: Spacing.lg, maxWidth: 1100, alignSelf: 'center', width: '100%',
  },
  toolsGridMobile: { gap: Spacing.md },
  toolCardTouch: { width: 260 },
  toolCardTouchMobile: { width: '100%' },
  toolCard: { minHeight: 170, position: 'relative' },
  toolIconBg: {
    width: 52, height: 52, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  toolTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  toolDesc: { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 20 },
  toolArrow: { position: 'absolute', top: Spacing.lg, right: Spacing.lg },

  ctaSection: {
    paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.lg, alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: Spacing.md, letterSpacing: -0.5,
  },
  ctaTitleMobile: { fontSize: FontSizes.xxl },
  ctaSubtitle: {
    fontSize: FontSizes.md, color: Colors.textMuted, textAlign: 'center',
    marginBottom: Spacing.xl, maxWidth: 500,
  },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md,
  },
  ctaButtonText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '700' },
});
