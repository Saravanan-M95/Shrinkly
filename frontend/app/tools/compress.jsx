import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import ToolPageLayout from '../../components/tools/ToolPageLayout';
import ImageDropZone from '../../components/tools/ImageDropZone';
import ImagePreviewCompare from '../../components/tools/ImagePreviewCompare';
import DownloadButton from '../../components/tools/DownloadButton';
import AlertToast from '../../components/tools/AlertToast';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { compressImage, formatFileSize } from '../../services/imageProcessor';

export default function CompressTool() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(70);
  const [maxWidth, setMaxWidth] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const compressed = await compressImage(
        file,
        quality / 100,
        maxWidth ? parseInt(maxWidth) : null
      );
      setResult(compressed);
    } catch (err) {
      setError('Compression failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    if (!file) return 'shrinqe-compressed.jpg';
    const name = file.name.replace(/\.[^.]+$/, '');
    return `shrinqe-${name}-compressed.jpg`;
  };

  return (
    <ToolPageLayout
      title="Compress Image"
      description="Reduce image file size while maintaining visual quality. Perfect for web optimization, email attachments, and faster loading."
      icon="contract-outline"
      iconColor="#EC4899"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      {/* Upload */}
      <ImageDropZone onImageSelect={handleImageSelect} />

      {/* Controls */}
      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Compression Settings</Text>

          {/* Quality Slider */}
          <View style={styles.sliderGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Quality</Text>
              <Text style={styles.sliderValue}>{quality}%</Text>
            </View>
            <input
              type="range"
              min="5"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#7C3AED',
                height: 6,
                cursor: 'pointer',
              }}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderHint}>Smaller file</Text>
              <Text style={styles.sliderHint}>Higher quality</Text>
            </View>
          </View>

          {/* Max Width */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Width (optional)</Text>
            <input
              type="number"
              value={maxWidth}
              onChange={(e) => setMaxWidth(e.target.value)}
              placeholder="e.g. 1920"
              style={{
                backgroundColor: Colors.bgInput,
                color: Colors.textPrimary,
                border: `1px solid ${Colors.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                width: isMobile ? '100%' : 200,
              }}
            />
          </View>

          {/* Compress Button */}
          <View style={styles.actionRow}>
            <button
              onClick={handleCompress}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              {processing ? '⏳ Compressing...' : '🗜️ Compress Image'}
            </button>
          </View>
        </Card>
      )}

      {/* Result */}
      {result && (
        <View style={styles.resultSection}>
          <ImagePreviewCompare
            originalUrl={previewUrl}
            processedUrl={result.url}
            originalSize={result.originalSize}
            processedSize={result.compressedSize}
            savings={result.savings}
            processedDimensions={{ width: result.width, height: result.height }}
          />

          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={getFileName()}
              size={result.compressedSize}
              label="Download Compressed"
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
    gap: Spacing.xl,
  },
  controlsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sliderGroup: {
    gap: Spacing.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sliderValue: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderHint: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionRow: {
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  resultSection: {
    marginTop: Spacing.xl,
    gap: Spacing.xl,
  },
  downloadRow: {
    alignItems: 'center',
  },
});
