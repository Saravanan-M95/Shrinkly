import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { formatFileSize } from '../../services/imageProcessor';

export default function ImagePreviewCompare({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  originalDimensions,
  processedDimensions,
  savings,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      {(savings != null || originalSize || processedSize) && (
        <View style={[styles.statsBar, isMobile && styles.statsBarMobile]}>
          {originalSize != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Original</Text>
              <Text style={styles.statValue}>{formatFileSize(originalSize)}</Text>
            </View>
          )}
          {processedSize != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Processed</Text>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {formatFileSize(processedSize)}
              </Text>
            </View>
          )}
          {savings != null && (
            <View style={[styles.savingsBadge, savings > 0 && styles.savingsBadgePositive]}>
              <Ionicons
                name={savings > 0 ? 'trending-down' : 'trending-up'}
                size={16}
                color={savings > 0 ? Colors.success : Colors.warning}
              />
              <Text style={[styles.savingsText, savings > 0 && styles.savingsTextPositive]}>
                {savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Image comparison */}
      <View style={[styles.compareGrid, isMobile && styles.compareGridMobile]}>
        {originalUrl && (
          <View style={[styles.imageBox, isMobile && styles.imageBoxMobile]}>
            <Text style={styles.imageLabel}>Original</Text>
            <View style={styles.imageWrapper}>
              <img
                src={originalUrl}
                alt="Original"
                style={{
                  maxWidth: '100%',
                  maxHeight: isMobile ? 180 : 280,
                  borderRadius: 8,
                  objectFit: 'contain',
                }}
              />
            </View>
            {originalDimensions && (
              <Text style={styles.dimensionText}>
                {originalDimensions.width} × {originalDimensions.height}px
              </Text>
            )}
          </View>
        )}

        {processedUrl && (
          <View style={[styles.imageBox, isMobile && styles.imageBoxMobile]}>
            <View style={styles.processedLabelRow}>
              <Text style={[styles.imageLabel, { color: Colors.success }]}>Processed</Text>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            </View>
            <View style={[styles.imageWrapper, styles.imageWrapperProcessed]}>
              <img
                src={processedUrl}
                alt="Processed"
                style={{
                  maxWidth: '100%',
                  maxHeight: isMobile ? 180 : 280,
                  borderRadius: 8,
                  objectFit: 'contain',
                }}
              />
            </View>
            {processedDimensions && (
              <Text style={styles.dimensionText}>
                {processedDimensions.width} × {processedDimensions.height}px
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.lg,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
  },
  statsBarMobile: {
    gap: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warningBg,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  savingsBadgePositive: {
    backgroundColor: Colors.successBg,
  },
  savingsText: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.warning,
  },
  savingsTextPositive: {
    color: Colors.success,
  },
  compareGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  compareGridMobile: {
    flexDirection: 'column',
  },
  imageBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  imageBoxMobile: {
    flex: undefined,
    width: '100%',
  },
  imageLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  processedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  imageWrapperProcessed: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  dimensionText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});
