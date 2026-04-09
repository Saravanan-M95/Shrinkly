import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.spring(menuAnim, {
      toValue,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
    setMenuOpen(false);
  };

  return (
    <View style={styles.headerOuter}>
      <LinearGradient
        colors={['rgba(15, 13, 21, 0.95)', 'rgba(26, 22, 37, 0.9)']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.push('/')} style={styles.logoContainer}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoIcon}
          >
            <Ionicons name="link" size={18} color="#fff" />
          </LinearGradient>
          <Text style={styles.logo}>ShrinQE</Text>
        </TouchableOpacity>

        {!isMobile && (
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.navLink}>
              <Text style={styles.navLinkText}>Home</Text>
            </TouchableOpacity>
            {isAuthenticated && (
              <>
                <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.navLink}>
                  <Text style={styles.navLinkText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/links')} style={styles.navLink}>
                  <Text style={styles.navLinkText}>My Links</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={styles.rightSection}>
          {isAuthenticated ? (
            <View style={styles.userSection}>
              {!isMobile && (
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name}
                </Text>
              )}
              <TouchableOpacity onPress={toggleMenu} style={styles.avatar}>
                {user?.avatarUrl ? (
                  <View style={styles.avatarImage}>
                    <Text style={styles.avatarText}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.avatarImage}
                  >
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authButtons}>
              <TouchableOpacity
                onPress={() => router.push('/login')}
                style={styles.loginBtn}
              >
                <Text style={styles.loginBtnText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signupBtn}
                >
                  <Text style={styles.signupBtnText}>Sign Up Free</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {isMobile && (
            <TouchableOpacity onPress={toggleMenu} style={styles.menuToggle}>
              <Ionicons
                name={menuOpen ? 'close' : 'menu'}
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Dropdown Menu */}
      {menuOpen && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: menuAnim,
              transform: [
                {
                  translateY: menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {isMobile && (
            <>
              <TouchableOpacity
                onPress={() => { router.push('/'); setMenuOpen(false); }}
                style={styles.dropdownItem}
              >
                <Ionicons name="home-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.dropdownText}>Home</Text>
              </TouchableOpacity>
              {isAuthenticated && (
                <>
                  <TouchableOpacity
                    onPress={() => { router.push('/dashboard'); setMenuOpen(false); }}
                    style={styles.dropdownItem}
                  >
                    <Ionicons name="grid-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.dropdownText}>Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { router.push('/links'); setMenuOpen(false); }}
                    style={styles.dropdownItem}
                  >
                    <Ionicons name="link-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.dropdownText}>My Links</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
          {isAuthenticated && (
            <>
              <TouchableOpacity
                onPress={() => { router.push('/settings'); setMenuOpen(false); }}
                style={styles.dropdownItem}
              >
                <Ionicons name="settings-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.dropdownText}>Settings</Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                <Text style={[styles.dropdownText, { color: Colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerOuter: {
    zIndex: 1000,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  navLink: {
    paddingVertical: Spacing.xs,
  },
  navLinkText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    maxWidth: 120,
  },
  avatar: {
    cursor: 'pointer',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  avatarText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
  },
  loginBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  loginBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  signupBtn: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  menuToggle: {
    padding: Spacing.xs,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 200,
    paddingVertical: Spacing.sm,
    zIndex: 1001,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  dropdownText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
});
