import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { formatFileSize } from '../../services/imageProcessor';

export default function DownloadButton({
  blob,
  url,
  fileName = 'shrinqe-output.jpg',
  size,
  label = 'Download',
  disabled = false,
  style,
}) {
  const handleDownload = () => {
    if (Platform.OS !== 'web') return;

    const downloadUrl = url || (blob ? URL.createObjectURL(blob) : null);
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke if we created the URL
    if (!url && blob) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleDownload}
      disabled={disabled || (!blob && !url)}
      activeOpacity={0.85}
      style={style}
    >
      <LinearGradient
        colors={disabled ? [Colors.bgTertiary, Colors.bgTertiary] : Colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <Ionicons
          name="download-outline"
          size={20}
          color={disabled ? Colors.textMuted : '#fff'}
        />
        <View style={styles.labelContainer}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {label}
          </Text>
          {size != null && (
            <Text style={[styles.size, disabled && styles.sizeDisabled]}>
              {formatFileSize(size)}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  buttonDisabled: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  labelContainer: {
    alignItems: 'flex-start',
  },
  label: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  labelDisabled: {
    color: Colors.textMuted,
  },
  size: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  sizeDisabled: {
    color: Colors.textMuted,
  },
});
