import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function ToolPageLayout({
  title,
  description,
  icon,
  iconColor = Colors.primary,
  children,
  badge = 'Free • No Upload Required',
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tool Header */}
        <LinearGradient
          colors={Colors.gradientHero}
          style={[styles.header, isMobile && styles.headerMobile]}
        >
          {/* Decorative orbs */}
          <View style={[styles.orb, styles.orbPurple]} />
          <View style={[styles.orb, styles.orbBlue]} />

          <View style={styles.headerContent}>
            {badge && (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.success} />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}

            <View style={styles.titleRow}>
              {icon && (
                <LinearGradient
                  colors={[iconColor, iconColor + 'CC']}
                  style={styles.iconBg}
                >
                  <Ionicons name={icon} size={28} color="#fff" />
                </LinearGradient>
              )}
              <Text style={[styles.title, isMobile && styles.titleMobile]}>
                {title}
              </Text>
            </View>

            {description && (
              <Text style={[styles.description, isMobile && styles.descriptionMobile]}>
                {description}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Tool Content */}
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {children}
        </View>

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
  header: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerMobile: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  orbPurple: {
    width: 300,
    height: 300,
    backgroundColor: Colors.primary,
    top: -80,
    right: -80,
  },
  orbBlue: {
    width: 200,
    height: 200,
    backgroundColor: Colors.accent,
    bottom: -40,
    left: -40,
  },
  headerContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  badgeText: {
    color: Colors.success,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  titleMobile: {
    fontSize: FontSizes.xxl,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  descriptionMobile: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
  },
  content: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  contentMobile: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
});
