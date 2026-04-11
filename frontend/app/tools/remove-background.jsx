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
import { removeBackground } from '../../services/imageProcessor';

export default function RemoveBackgroundTool() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  }, []);

  const handleRemove = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const processed = await removeBackground(file);
      setResult(processed);
    } catch (err) {
      setError('Background removal failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Remove Background"
      description="Instantly detach the main subject from any background. Driven entirely by on-device AI algorithms."
      icon="cut-outline"
      iconColor="#8B5CF6"
      badge="✨ Neural Network • 100% Client-Side"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Background Removal Settings</Text>

          <View style={styles.betaBadge}>
            <Ionicons name="sparkles" size={14} color={Colors.warning} />
            <Text style={styles.betaText}>
              Powered by On-Device AI. The model will securely download (~50MB) on first use and execute entirely inside your browser. No images are uploaded to the cloud!
            </Text>
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleRemove}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
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
              {processing ? '⏳ Removing...' : '✂️ Remove Background'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Background Removed</Text>
            {/* Checkerboard pattern to show transparency */}
            <div
              style={{
                background: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50%/20px 20px',
                borderRadius: 12,
                padding: 8,
                display: 'inline-block',
              }}
            >
              <img
                src={result.url}
                alt="No background"
                style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 8, objectFit: 'contain', display: 'block' }}
              />
            </div>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName="shrinqe-no-bg.png"
              size={result.blob.size}
              label="Download PNG"
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
  betaBadge: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.warningBg, padding: Spacing.md, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  betaText: { fontSize: FontSizes.sm, color: Colors.warning, flex: 1, lineHeight: 20 },
  sliderGroup: { gap: Spacing.sm },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  sliderValue: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.primaryLight },
  sliderHints: { flexDirection: 'row', justifyContent: 'space-between' },
  hintText: { fontSize: FontSizes.xs, color: Colors.textMuted },
  inputGroup: { gap: Spacing.sm },
  inputLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  hint: { fontSize: FontSizes.xs, color: Colors.textMuted },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  colorChip: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 2, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  autoChip: { backgroundColor: Colors.bgTertiary },
  colorChipActive: { borderColor: Colors.primary, borderWidth: 2.5 },
  autoText: { fontSize: FontSizes.xs, color: Colors.textMuted, fontWeight: '700' },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg, alignItems: 'center' },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  downloadRow: { alignItems: 'center' },
});
