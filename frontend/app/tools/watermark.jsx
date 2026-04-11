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
import { addWatermark } from '../../services/imageProcessor';

export default function WatermarkTool() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [file, setFile] = useState(null);
  const [text, setText] = useState('ShrinQE');
  const [position, setPosition] = useState('bottom-right');
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(50);
  const [color, setColor] = useState('#FFFFFF');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const positions = [
    { id: 'top-left', label: 'TL', icon: 'arrow-up' },
    { id: 'top-right', label: 'TR', icon: 'arrow-up' },
    { id: 'center', label: 'C', icon: 'locate' },
    { id: 'bottom-left', label: 'BL', icon: 'arrow-down' },
    { id: 'bottom-right', label: 'BR', icon: 'arrow-down' },
  ];

  const handleImageSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  }, []);

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    try {
      const watermarked = await addWatermark(file, text, {
        position,
        fontSize,
        opacity: opacity / 100,
        color,
      });
      setResult(watermarked);
    } catch (err) {
      setError('Watermark failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    if (!file) return 'shrinqe-watermarked.jpg';
    const name = file.name.replace(/\.[^.]+$/, '');
    const ext = file.name.split('.').pop();
    return `shrinqe-${name}-watermarked.${ext}`;
  };

  return (
    <ToolPageLayout
      title="Watermark Image"
      description="Add a custom text watermark to protect your images. Choose position, size, opacity, and color."
      icon="water-outline"
      iconColor="#6366F1"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Watermark Settings</Text>

          {/* Text input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Watermark Text</Text>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter watermark text..."
              style={{
                backgroundColor: Colors.bgInput,
                color: Colors.textPrimary,
                border: `1px solid ${Colors.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                width: '100%',
              }}
            />
          </View>

          {/* Position */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Position</Text>
            <View style={styles.posGrid}>
              {positions.map((pos) => (
                <TouchableOpacity
                  key={pos.id}
                  onPress={() => setPosition(pos.id)}
                  style={[
                    styles.posChip,
                    position === pos.id && styles.posChipActive,
                  ]}
                >
                  <Text style={[
                    styles.posText,
                    position === pos.id && styles.posTextActive,
                  ]}>
                    {pos.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Controls row */}
          <View style={[styles.controlsRow, isMobile && styles.controlsRowMobile]}>
            {/* Font Size */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.sliderHeader}>
                <Text style={styles.inputLabel}>Font Size</Text>
                <Text style={styles.sliderValue}>{fontSize}px</Text>
              </View>
              <input
                type="range"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366F1', height: 6, cursor: 'pointer' }}
              />
            </View>

            {/* Opacity */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.sliderHeader}>
                <Text style={styles.inputLabel}>Opacity</Text>
                <Text style={styles.sliderValue}>{opacity}%</Text>
              </View>
              <input
                type="range"
                min="5"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366F1', height: 6, cursor: 'pointer' }}
              />
            </View>
          </View>

          {/* Color picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Color</Text>
            <View style={styles.colorRow}>
              {['#FFFFFF', '#000000', '#FF0000', '#7C3AED', '#3B82F6', '#10B981'].map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    color === c && styles.colorSwatchActive,
                  ]}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 32, height: 32, cursor: 'pointer', border: 'none', borderRadius: 6 }}
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleWatermark}
              disabled={processing || !text.trim()}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #6366F1, #EC4899)',
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
              {processing ? '⏳ Applying...' : '💧 Add Watermark'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Watermark Added</Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Watermarked"
                style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={getFileName()}
              size={result.blob.size}
              label="Download Watermarked"
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
  inputGroup: { gap: Spacing.sm },
  inputLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  controlsRow: { flexDirection: 'row', gap: Spacing.xl },
  controlsRowMobile: { flexDirection: 'column', gap: Spacing.lg },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderValue: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.primaryLight },
  posGrid: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  posChip: {
    backgroundColor: Colors.bgTertiary, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  posChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  posText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textSecondary },
  posTextActive: { color: Colors.primaryLight },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  colorSwatch: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 2, borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: Colors.primaryLight, borderWidth: 2.5 },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
