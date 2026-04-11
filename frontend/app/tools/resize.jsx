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
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { resizeImage, getImageInfo } from '../../services/imageProcessor';

export default function ResizeTool() {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  const [file, setFile] = useState(null);
  const [imgInfo, setImgInfo] = useState(null);
  const [targetWidth, setTargetWidth] = useState('');
  const [targetHeight, setTargetHeight] = useState('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const presets = [
    { label: 'HD', w: 1280, h: 720 },
    { label: 'Full HD', w: 1920, h: 1080 },
    { label: '4K', w: 3840, h: 2160 },
    { label: 'Instagram', w: 1080, h: 1080 },
    { label: 'Twitter', w: 1200, h: 675 },
    { label: 'Facebook', w: 1200, h: 630 },
    { label: 'Thumbnail', w: 300, h: 300 },
    { label: 'Icon', w: 64, h: 64 },
  ];

  const handleImageSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    if (selectedFile) {
      const info = await getImageInfo(selectedFile);
      setImgInfo(info);
      setTargetWidth(String(info.width));
      setTargetHeight(String(info.height));
    } else {
      setImgInfo(null);
      setTargetWidth('');
      setTargetHeight('');
    }
  }, []);

  const handleWidthChange = (val) => {
    setTargetWidth(val);
    if (maintainAspect && imgInfo && val) {
      const ratio = imgInfo.height / imgInfo.width;
      setTargetHeight(String(Math.round(Number(val) * ratio)));
    }
  };

  const handleHeightChange = (val) => {
    setTargetHeight(val);
    if (maintainAspect && imgInfo && val) {
      const ratio = imgInfo.width / imgInfo.height;
      setTargetWidth(String(Math.round(Number(val) * ratio)));
    }
  };

  const applyPreset = (preset) => {
    setTargetWidth(String(preset.w));
    setTargetHeight(String(preset.h));
    setMaintainAspect(false);
  };

  const handleResize = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const resized = await resizeImage(
        file,
        targetWidth ? parseInt(targetWidth) : null,
        targetHeight ? parseInt(targetHeight) : null,
        maintainAspect
      );
      setResult(resized);
    } catch (err) {
      setError('Resize failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    if (!file) return 'shrinqe-resized.jpg';
    const name = file.name.replace(/\.[^.]+$/, '');
    const ext = file.name.split('.').pop();
    return `shrinqe-${name}-${targetWidth}x${targetHeight}.${ext}`;
  };

  return (
    <ToolPageLayout
      title="Resize Image"
      description="Change image dimensions to any size. Use presets for popular social media sizes or enter custom dimensions."
      icon="resize-outline"
      iconColor="#3B82F6"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && imgInfo && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Resize Settings</Text>

          {/* Original info */}
          <View style={styles.infoBar}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>
              Original: {imgInfo.width} × {imgInfo.height}px
            </Text>
          </View>

          {/* Presets */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsLabel}>Quick Presets</Text>
            <View style={styles.presetsGrid}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => applyPreset(p)}
                  style={[
                    styles.presetChip,
                    targetWidth === String(p.w) && targetHeight === String(p.h) && styles.presetChipActive,
                  ]}
                >
                  <Text style={[
                    styles.presetLabel,
                    targetWidth === String(p.w) && targetHeight === String(p.h) && styles.presetLabelActive,
                  ]}>
                    {p.label}
                  </Text>
                  <Text style={styles.presetDim}>{p.w}×{p.h}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dimension Inputs */}
          <View style={[styles.dimensionRow, isMobile && styles.dimensionRowMobile]}>
            <View style={styles.dimInput}>
              <Text style={styles.inputLabel}>Width (px)</Text>
              <input
                type="number"
                value={targetWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                style={{
                  backgroundColor: Colors.bgInput,
                  color: Colors.textPrimary,
                  border: `1px solid ${Colors.border}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </View>

            {/* Lock/Unlock aspect ratio */}
            <TouchableOpacity
              onPress={() => setMaintainAspect(!maintainAspect)}
              style={styles.lockButton}
            >
              <Ionicons
                name={maintainAspect ? 'lock-closed' : 'lock-open'}
                size={20}
                color={maintainAspect ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.dimInput}>
              <Text style={styles.inputLabel}>Height (px)</Text>
              <input
                type="number"
                value={targetHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                style={{
                  backgroundColor: Colors.bgInput,
                  color: Colors.textPrimary,
                  border: `1px solid ${Colors.border}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleResize}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
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
              {processing ? '⏳ Resizing...' : '📐 Resize Image'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Resized Successfully</Text>
            <Text style={styles.resultDim}>
              New dimensions: {result.width} × {result.height}px
            </Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Resized"
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
              label="Download Resized"
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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    padding: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  presetsSection: {
    gap: Spacing.sm,
  },
  presetsLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetChip: {
    backgroundColor: Colors.bgTertiary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  presetChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  presetLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetLabelActive: {
    color: Colors.primaryLight,
  },
  presetDim: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  dimensionRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  dimInput: {
    flex: 1,
    gap: Spacing.xs + 2,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  lockButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 2,
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
