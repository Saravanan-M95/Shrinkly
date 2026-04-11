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
import { applyFilters } from '../../services/imageProcessor';

const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
};

const FILTER_PRESETS = [
  { name: 'None', filters: {} },
  { name: 'Vivid', filters: { brightness: 110, contrast: 120, saturation: 140 } },
  { name: 'Moody', filters: { brightness: 90, contrast: 110, saturation: 80, sepia: 15 } },
  { name: 'B&W', filters: { grayscale: 100, contrast: 110 } },
  { name: 'Retro', filters: { sepia: 60, brightness: 105, contrast: 90 } },
  { name: 'Cool', filters: { hueRotate: 30, brightness: 105, saturation: 110 } },
  { name: 'Warm', filters: { hueRotate: 340, brightness: 108, saturation: 120 } },
  { name: 'Dreamy', filters: { blur: 1, brightness: 115, saturation: 120 } },
];

export default function PhotoEditorTool() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activePreset, setActivePreset] = useState('None');

  const handleImageSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setFilters({ ...DEFAULT_FILTERS });
    setActivePreset('None');
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const applyPreset = (preset) => {
    setFilters({ ...DEFAULT_FILTERS, ...preset.filters });
    setActivePreset(preset.name);
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setActivePreset('None');
  };

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const edited = await applyFilters(file, filters);
      setResult(edited);
    } catch (err) {
      setError('Edit failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getCSSFilter = () => {
    const parts = [];
    if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
    if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
    if (filters.saturation !== 100) parts.push(`saturate(${filters.saturation}%)`);
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
    if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
    if (filters.hueRotate > 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
    if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
    return parts.join(' ') || 'none';
  };

  const sliderConfigs = [
    { key: 'brightness', label: 'Brightness', icon: 'sunny-outline', min: 0, max: 200, color: '#F59E0B' },
    { key: 'contrast', label: 'Contrast', icon: 'contrast-outline', min: 0, max: 200, color: '#EF4444' },
    { key: 'saturation', label: 'Saturation', icon: 'color-palette-outline', min: 0, max: 200, color: '#EC4899' },
    { key: 'blur', label: 'Blur', icon: 'water-outline', min: 0, max: 20, color: '#3B82F6' },
    { key: 'grayscale', label: 'Grayscale', icon: 'moon-outline', min: 0, max: 100, color: '#6B7280' },
    { key: 'sepia', label: 'Sepia', icon: 'film-outline', min: 0, max: 100, color: '#92400E' },
    { key: 'hueRotate', label: 'Hue Rotate', icon: 'color-filter-outline', min: 0, max: 360, color: '#7C3AED' },
    { key: 'invert', label: 'Invert', icon: 'remove-circle-outline', min: 0, max: 100, color: '#14B8A6' },
  ];

  return (
    <ToolPageLayout
      title="Photo Editor"
      description="Fine-tune your images with professional filters. Adjust brightness, contrast, saturation, and more — or use a preset."
      icon="color-wand-outline"
      iconColor="#EC4899"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <>
          {/* Live Preview */}
          {previewUrl && (
            <Card variant="glass" style={styles.previewCard}>
              <Text style={styles.previewLabel}>Live Preview</Text>
              <View style={styles.previewContainer}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: isMobile ? 250 : 350,
                    borderRadius: 8,
                    objectFit: 'contain',
                    filter: getCSSFilter(),
                    transition: 'filter 0.2s ease',
                  }}
                />
              </View>
            </Card>
          )}

          {/* Presets */}
          <Card variant="glass" style={styles.controls}>
            <View style={styles.sectionHeader}>
              <Text style={styles.controlsTitle}>Filter Presets</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetGrid}>
              {FILTER_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  onPress={() => applyPreset(preset)}
                  style={[
                    styles.presetChip,
                    activePreset === preset.name && styles.presetChipActive,
                  ]}
                >
                  <Text style={[
                    styles.presetText,
                    activePreset === preset.name && styles.presetTextActive,
                  ]}>
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Sliders */}
          <Card variant="glass" style={styles.controls}>
            <Text style={styles.controlsTitle}>Fine-Tune</Text>

            <View style={styles.slidersGrid}>
              {sliderConfigs.map((cfg) => (
                <View key={cfg.key} style={[styles.sliderItem, isMobile && styles.sliderItemMobile]}>
                  <View style={styles.sliderHeader}>
                    <View style={styles.sliderLabelRow}>
                      <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                      <Text style={styles.sliderLabel}>{cfg.label}</Text>
                    </View>
                    <Text style={[styles.sliderValue, { color: cfg.color }]}>
                      {filters[cfg.key]}{cfg.key === 'hueRotate' ? '°' : cfg.key === 'blur' ? 'px' : '%'}
                    </Text>
                  </View>
                  <input
                    type="range"
                    min={cfg.min}
                    max={cfg.max}
                    value={filters[cfg.key]}
                    onChange={(e) => updateFilter(cfg.key, Number(e.target.value))}
                    style={{ width: '100%', accentColor: cfg.color, height: 5, cursor: 'pointer' }}
                  />
                </View>
              ))}
            </View>

            <View style={styles.actionRow}>
              <button
                onClick={handleApply}
                disabled={processing}
                style={{
                  background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #EC4899, #7C3AED)',
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
                {processing ? '⏳ Applying...' : '✨ Apply & Export'}
              </button>
            </View>
          </Card>
        </>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Edits Applied</Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Edited"
                style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName="shrinqe-edited-photo.jpg"
              size={result.blob.size}
              label="Download Edited"
            />
          </View>
        </View>
      )}
    </ToolPageLayout>
  );
}

const styles = StyleSheet.create({
  controls: { marginTop: Spacing.lg, padding: Spacing.xl, gap: Spacing.lg },
  controlsTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetText: { fontSize: FontSizes.sm, color: Colors.error, fontWeight: '600' },
  previewCard: { marginTop: Spacing.xl, padding: Spacing.lg, gap: Spacing.md },
  previewLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewContainer: { alignItems: 'center', backgroundColor: Colors.bgSecondary, borderRadius: BorderRadius.md, padding: Spacing.md },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetChip: {
    backgroundColor: Colors.bgTertiary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md + 4,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  presetChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  presetText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  presetTextActive: { color: Colors.primaryLight },
  slidersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  sliderItem: { width: '47%', gap: Spacing.xs },
  sliderItemMobile: { width: '100%' },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sliderLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textSecondary },
  sliderValue: { fontSize: FontSizes.xs, fontWeight: '800' },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
