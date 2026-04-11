import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

import { TOOLS_CATEGORIES } from '../../constants/tools';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const toolsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(toolsAnim, {
      toValue: toolsOpen ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [toolsOpen, toolsAnim]);

  const hoverTimeoutRef = useRef(null);

  const handleMouseEnterTools = () => {
    if (Platform.OS !== 'web') return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setToolsOpen(true);
  };

  const handleMouseLeaveTools = () => {
    if (Platform.OS !== 'web') return;
    hoverTimeoutRef.current = setTimeout(() => {
      setToolsOpen(false);
    }, 300);
  };

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.spring(menuAnim, {
      toValue,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const toggleTools = () => {
    setToolsOpen(!toolsOpen);
    if (menuOpen) toggleMenu();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
    setMenuOpen(false);
    setToolsOpen(false);
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
              <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.navLink}>
                <Text style={styles.navLinkText}>Link Suite</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={toggleTools} 
              onMouseEnter={handleMouseEnterTools}
              onMouseLeave={handleMouseLeaveTools}
              style={[styles.navLink, toolsOpen && styles.navLinkActive]}
            >
              <View style={styles.toolsLinkContent}>
                <Text style={[styles.navLinkText, toolsOpen && styles.navLinkTextActive]}>Image Suite</Text>
                <Ionicons name={toolsOpen ? 'chevron-up' : 'chevron-down'} size={14} color={toolsOpen ? Colors.primary : Colors.textSecondary} />
              </View>
            </TouchableOpacity>
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
                {user?.avatarUrl && !imageError ? (
                  <Image 
                    source={{ uri: user.avatarUrl }} 
                    style={styles.avatarImage} 
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.avatarImage}
                  >
                    <Text style={styles.avatarText}>
                      {user?.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : 'U'}
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

      {/* Desktop Mega Menu */}
      {!isMobile && toolsOpen && (
        <Animated.View
          onMouseEnter={handleMouseEnterTools}
          onMouseLeave={handleMouseLeaveTools}
          style={[
            styles.megaMenu,
            {
              opacity: toolsAnim,
              transform: [
                {
                  translateY: toolsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.megaGrid}>
            {TOOLS_CATEGORIES.map((cat, idx) => (
              <View key={idx} style={styles.megaColumn}>
                <Text style={styles.megaCategoryTitle}>{cat.category}</Text>
                {cat.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => { router.push(item.route); setToolsOpen(false); }}
                    style={styles.megaItem}
                  >
                    <View style={[styles.megaIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View>
                      <Text style={styles.megaItemTitle}>{item.title}</Text>
                      <Text style={styles.megaItemDesc} numberOfLines={1}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Mobile Dropdown Menu */}
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
                <TouchableOpacity
                  onPress={() => { router.push('/dashboard'); setMenuOpen(false); }}
                  style={styles.dropdownItem}
                >
                  <Ionicons name="link-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.dropdownText}>Link Suite</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.dropdownDivider} />
              <Text style={styles.mobileCategoryLabel}>Image Suite</Text>
              
              {TOOLS_CATEGORIES.map((cat) => (
                <View key={cat.category}>
                  {cat.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => { router.push(item.route); setMenuOpen(false); }}
                      style={styles.dropdownItem}
                    >
                      <Ionicons name={item.icon} size={18} color={item.color} />
                      <Text style={styles.dropdownText}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

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
  navLinkActive: {
    borderBottomWidth: 0,
  },
  navLinkTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  toolsLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  
  // Mega Menu Styles
  megaMenu: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -450, // Center a 900px menu
    width: 900,
    backgroundColor: 'rgba(30, 26, 46, 0.95)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    padding: Spacing.xl,
    zIndex: 1002,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  megaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  megaColumn: {
    flex: 1,
    gap: Spacing.md,
  },
  megaCategoryTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  megaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    // Hover handled by opacity or bg in a real web env, 
    // here we just use the card look
  },
  megaIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  megaItemTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  megaItemDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    maxWidth: 140,
  },
  
  // Mobile Mega Menu
  mobileCategoryLabel: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
});

