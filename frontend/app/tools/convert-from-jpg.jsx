import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import ToolPageLayout from '../../components/tools/ToolPageLayout';
import ImageDropZone from '../../components/tools/ImageDropZone';
import DownloadButton from '../../components/tools/DownloadButton';
import AlertToast from '../../components/tools/AlertToast';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { convertFromJPG } from '../../services/imageProcessor';

export default function ConvertFromJPGTool() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('image/png');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const formats = [
    { label: 'PNG', mime: 'image/png', ext: 'png', desc: 'Lossless, supports transparency' },
    { label: 'WEBP', mime: 'image/webp', ext: 'webp', desc: 'Modern format, smaller files' },
  ];

  const handleImageSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const converted = await convertFromJPG(file, outputFormat);
      setResult(converted);
    } catch (err) {
      setError('Conversion failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    const name = file?.name?.replace(/\.[^.]+$/, '') || 'converted';
    const ext = formats.find(f => f.mime === outputFormat)?.ext || 'png';
    return `shrinqe-${name}.${ext}`;
  };

  return (
    <ToolPageLayout
      title="Convert from JPG"
      description="Convert JPG images to PNG or WEBP format. Get lossless quality or modern compression."
      icon="swap-horizontal-outline"
      iconColor="#10B981"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Output Format</Text>

          <View style={styles.formatGrid}>
            {formats.map((fmt) => (
              <TouchableOpacity
                key={fmt.mime}
                onPress={() => setOutputFormat(fmt.mime)}
                style={[
                  styles.formatCard,
                  outputFormat === fmt.mime && styles.formatCardActive,
                ]}
              >
                <Text style={[
                  styles.formatLabel,
                  outputFormat === fmt.mime && styles.formatLabelActive,
                ]}>
                  {fmt.label}
                </Text>
                <Text style={styles.formatDesc}>{fmt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleConvert}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #10B981, #3B82F6)',
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
              {processing ? '⏳ Converting...' : '🔄 Convert Image'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Converted Successfully</Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Converted"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={getFileName()}
              size={result.blob.size}
              label={`Download ${formats.find(f => f.mime === outputFormat)?.label}`}
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
  formatGrid: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  formatCard: {
    flex: 1, minWidth: 160, backgroundColor: Colors.bgTertiary, borderRadius: BorderRadius.md,
    padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.borderLight, gap: Spacing.xs,
  },
  formatCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.1)' },
  formatLabel: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  formatLabelActive: { color: Colors.primaryLight },
  formatDesc: { fontSize: FontSizes.xs, color: Colors.textMuted, lineHeight: 18 },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
