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
import { convertToJPG, formatFileSize } from '../../services/imageProcessor';

export default function ConvertToJPGTool() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(92);
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

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const converted = await convertToJPG(file, quality / 100);
      setResult(converted);
    } catch (err) {
      setError('Conversion failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    if (!file) return 'shrinqe-converted.jpg';
    const name = file.name.replace(/\.[^.]+$/, '');
    return `shrinqe-${name}.jpg`;
  };

  return (
    <ToolPageLayout
      title="Convert to JPG"
      description="Convert PNG, WEBP, GIF, BMP, and other image formats to JPG. Transparent areas are filled with white."
      icon="swap-horizontal-outline"
      iconColor="#3B82F6"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>JPG Settings</Text>

          <View style={styles.infoBar}>
            <Text style={styles.infoText}>📄 Source format: {file.type.split('/')[1]?.toUpperCase() || 'Unknown'}</Text>
            <Text style={styles.infoText}>→ JPG</Text>
          </View>

          <View style={styles.sliderGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Quality</Text>
              <Text style={styles.sliderValue}>{quality}%</Text>
            </View>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#3B82F6',
                height: 6,
                cursor: 'pointer',
              }}
            />
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleConvert}
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
              }}
            >
              {processing ? '⏳ Converting...' : '🔄 Convert to JPG'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <ImagePreviewCompare
            originalUrl={previewUrl}
            processedUrl={result.url}
            originalSize={file.size}
            processedSize={result.blob.size}
            savings={Math.round((1 - result.blob.size / file.size) * 100)}
          />
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={getFileName()}
              size={result.blob.size}
              label="Download JPG"
            />
          </View>
        </View>
      )}
    </ToolPageLayout>
  );
}

const styles = StyleSheet.create({
  controls: { marginTop: Spacing.xl, padding: Spacing.xl, gap: Spacing.lg },
  controlsTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgSecondary, padding: Spacing.md, borderRadius: BorderRadius.sm,
  },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  sliderGroup: { gap: Spacing.sm },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  sliderValue: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.accentLight },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.xl },
  downloadRow: { alignItems: 'center' },
});
