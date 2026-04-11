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
import ImagePreviewCompare from '../../components/tools/ImagePreviewCompare';
import DownloadButton from '../../components/tools/DownloadButton';
import AlertToast from '../../components/tools/AlertToast';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { upscaleImage, getImageInfo } from '../../services/imageProcessor';

export default function UpscaleTool() {
  const [file, setFile] = useState(null);
  const [imgInfo, setImgInfo] = useState(null);
  const [scale, setScale] = useState(2);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const scales = [
    { value: 2, label: '2×', desc: 'Double size' },
    { value: 3, label: '3×', desc: 'Triple size' },
    { value: 4, label: '4×', desc: 'Quadruple size' },
  ];

  const handleImageSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    if (selectedFile) {
      const info = await getImageInfo(selectedFile);
      setImgInfo(info);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setImgInfo(null);
      setPreviewUrl(null);
    }
  }, []);

  const handleUpscale = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const upscaled = await upscaleImage(file, scale);
      setResult(upscaled);
    } catch (err) {
      setError('Upscale failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Upscale Image"
      description="Enlarge your images with smooth interpolation. Increase resolution by 2×, 3×, or 4× the original size."
      icon="expand-outline"
      iconColor="#3B82F6"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && imgInfo && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Upscale Settings</Text>

          {/* Scale selector */}
          <View style={styles.scaleGrid}>
            {scales.map((s) => (
              <TouchableOpacity
                key={s.value}
                onPress={() => setScale(s.value)}
                style={[
                  styles.scaleCard,
                  scale === s.value && styles.scaleCardActive,
                ]}
              >
                <Text style={[
                  styles.scaleLabel,
                  scale === s.value && styles.scaleLabelActive,
                ]}>
                  {s.label}
                </Text>
                <Text style={styles.scaleDesc}>{s.desc}</Text>
                <Text style={styles.scaleDim}>
                  {imgInfo.width * s.value} × {imgInfo.height * s.value}px
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current info */}
          <View style={styles.infoBar}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>
              {imgInfo.width} × {imgInfo.height}px → {imgInfo.width * scale} × {imgInfo.height * scale}px
            </Text>
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleUpscale}
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
              {processing ? '⏳ Upscaling...' : `🔍 Upscale ${scale}×`}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <ImagePreviewCompare
            originalUrl={previewUrl}
            processedUrl={result.url}
            originalDimensions={imgInfo ? { width: imgInfo.width, height: imgInfo.height } : null}
            processedDimensions={{ width: result.width, height: result.height }}
          />
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={`shrinqe-upscaled-${scale}x.jpg`}
              size={result.blob.size}
              label={`Download ${scale}× Image`}
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
  scaleGrid: { flexDirection: 'row', gap: Spacing.md },
  scaleCard: {
    flex: 1, backgroundColor: Colors.bgTertiary, borderRadius: BorderRadius.md,
    padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.borderLight,
    alignItems: 'center', gap: Spacing.xs,
  },
  scaleCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.1)' },
  scaleLabel: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.textPrimary },
  scaleLabelActive: { color: Colors.primaryLight },
  scaleDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  scaleDim: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgSecondary, padding: Spacing.md, borderRadius: BorderRadius.sm,
  },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.xl },
  downloadRow: { alignItems: 'center' },
});
