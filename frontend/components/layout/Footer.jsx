import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function Footer() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.footer}>
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <View style={styles.brandSection}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="link" size={16} color="#fff" />
              </View>
              <Text style={styles.logo}>ShrinQE</Text>
            </View>
            <Text style={styles.brandDesc}>
              Shrink your links and your images. URL shortener with analytics, plus 13 free image tools — all in one place.
            </Text>
          </View>

          <View style={styles.linksGroup}>
            <Text style={styles.linksTitle}>Products</Text>
            <TouchableOpacity onPress={() => router.push('/')}><Text style={styles.linkText}>Link Suite</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/tools')}><Text style={styles.linkText}>Image Suite</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/dashboard')}><Text style={styles.linkText}>Analytics</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/links')}><Text style={styles.linkText}>QR Codes</Text></TouchableOpacity>
          </View>


          <View style={styles.linksGroup}>
            <Text style={styles.linksTitle}>Company</Text>
            <TouchableOpacity><Text style={styles.linkText}>About</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkText}>Blog</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkText}>Careers</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkText}>Contact</Text></TouchableOpacity>
          </View>

          <View style={styles.linksGroup}>
            <Text style={styles.linksTitle}>Legal</Text>
            <TouchableOpacity><Text style={styles.linkText}>Privacy Policy</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkText}>Terms of Service</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkText}>Cookie Policy</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} ShrinQE. All rights reserved.
          </Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-twitter" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-github" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-linkedin" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  container: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  containerMobile: {},
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  sectionMobile: {
    flexDirection: 'column',
  },
  brandSection: {
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm + 4,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  brandDesc: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  linksGroup: {
    gap: Spacing.sm + 2,
  },
  linksTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  linkText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.lg,
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  copyright: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
