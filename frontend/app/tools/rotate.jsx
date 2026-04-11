import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ToolPageLayout from '../../components/tools/ToolPageLayout';
import ImageDropZone from '../../components/tools/ImageDropZone';
import DownloadButton from '../../components/tools/DownloadButton';
import AlertToast from '../../components/tools/AlertToast';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { rotateImage } from '../../services/imageProcessor';

export default function RotateTool() {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  const [file, setFile] = useState(null);
  const [degrees, setDegrees] = useState(90);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const quickAngles = [90, 180, 270, 45, -45, 135];

  const handleImageSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const rotated = await rotateImage(file, degrees, flipH, flipV);
      setResult(rotated);
    } catch (err) {
      setError('Rotate failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    if (!file) return 'shrinqe-rotated.jpg';
    const name = file.name.replace(/\.[^.]+$/, '');
    const ext = file.name.split('.').pop();
    return `shrinqe-${name}-rotated.${ext}`;
  };

  return (
    <ToolPageLayout
      title="Rotate Image"
      description="Rotate your image to any angle or flip it horizontally/vertically. Perfect for correcting orientation."
      icon="refresh-outline"
      iconColor="#F59E0B"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Rotation Settings</Text>

          {/* Quick angle buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick Rotate</Text>
            <View style={styles.angleGrid}>
              {quickAngles.map((angle) => (
                <TouchableOpacity
                  key={angle}
                  onPress={() => setDegrees(angle)}
                  style={[
                    styles.angleChip,
                    degrees === angle && styles.angleChipActive,
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={14}
                    color={degrees === angle ? Colors.primaryLight : Colors.textMuted}
                  />
                  <Text style={[
                    styles.angleText,
                    degrees === angle && styles.angleTextActive,
                  ]}>
                    {angle}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom angle */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Custom Angle</Text>
            <View style={styles.customAngleRow}>
              <input
                type="range"
                min="-180"
                max="180"
                value={degrees}
                onChange={(e) => setDegrees(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#7C3AED',
                  height: 6,
                  cursor: 'pointer',
                }}
              />
              <View style={styles.degreeBadge}>
                <Text style={styles.degreeText}>{degrees}°</Text>
              </View>
            </View>
          </View>

          {/* Flip buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Flip</Text>
            <View style={styles.flipRow}>
              <TouchableOpacity
                onPress={() => setFlipH(!flipH)}
                style={[styles.flipButton, flipH && styles.flipButtonActive]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={20}
                  color={flipH ? Colors.primaryLight : Colors.textMuted}
                />
                <Text style={[styles.flipText, flipH && styles.flipTextActive]}>
                  Horizontal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFlipV(!flipV)}
                style={[styles.flipButton, flipV && styles.flipButtonActive]}
              >
                <Ionicons
                  name="swap-vertical-outline"
                  size={20}
                  color={flipV ? Colors.primaryLight : Colors.textMuted}
                />
                <Text style={[styles.flipText, flipV && styles.flipTextActive]}>
                  Vertical
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview of rotation */}
          {previewUrl && (
            <View style={styles.previewContainer}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: isMobile ? 200 : 300,
                  maxHeight: isMobile ? 200 : 300,
                  objectFit: 'contain',
                  transform: `rotate(${degrees}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  transition: 'transform 0.3s ease',
                  borderRadius: 8,
                }}
              />
            </View>
          )}

          <View style={styles.actionRow}>
            <button
              onClick={handleRotate}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #F59E0B, #EC4899)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {processing ? '⏳ Rotating...' : '🔄 Rotate Image'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Rotated Successfully</Text>
            <Text style={styles.resultDim}>
              New dimensions: {result.width} × {result.height}px
            </Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Rotated"
                style={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 8,
                  objectFit: 'contain',
                }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={getFileName()}
              size={result.blob.size}
              label="Download Rotated"
            />
          </View>
        </View>
      )}
    </ToolPageLayout>
  );
}

const styles = StyleSheet.create({
  controls: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  controlsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  angleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  angleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgTertiary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  angleChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  angleText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  angleTextActive: {
    color: Colors.primaryLight,
  },
  customAngleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  degreeBadge: {
    backgroundColor: Colors.bgTertiary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    minWidth: 55,
    alignItems: 'center',
  },
  degreeText: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  flipRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgTertiary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  flipButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  flipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  flipTextActive: {
    color: Colors.primaryLight,
  },
  previewContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.md,
  },
  actionRow: {
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  resultSection: {
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  resultCard: {
    padding: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.success,
  },
  resultDim: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  resultPreview: {
    alignItems: 'center',
    width: '100%',
  },
  downloadRow: {
    alignItems: 'center',
  },
});
