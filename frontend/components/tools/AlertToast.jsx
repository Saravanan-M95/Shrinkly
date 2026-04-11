import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

/**
 * Themed error/success toast alert — replaces browser's default alert()
 */
export default function AlertToast({ visible, message, type = 'error', onDismiss, duration = 5000 }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => onDismiss?.(), duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -100, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const isError = type === 'error';
  const iconName = isError ? 'alert-circle' : 'checkmark-circle';
  const accentColor = isError ? '#EF4444' : Colors.success;
  const bgColor = isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';
  const borderColor = isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={iconName} size={20} color={accentColor} />
        <Text style={[styles.message, { color: accentColor }]} numberOfLines={3}>
          {message}
        </Text>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backdropFilter: 'blur(12px)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  message: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
});
