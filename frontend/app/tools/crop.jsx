import React, { useState, useCallback, useRef } from 'react';
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
import { cropImage, getImageInfo } from '../../services/imageProcessor';

export default function CropTool() {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  const [file, setFile] = useState(null);
  const [imgInfo, setImgInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mouse drag state
  const [dragMode, setDragMode] = useState(null); // 'draw', 'move', 'nw', 'ne', 'sw', 'se'
  const [dragStartPos, setDragStartPos] = useState(null);
  const [initialCropBox, setInitialCropBox] = useState(null);
  const [drawStart, setDrawStart] = useState(null);

  const containerRef = useRef(null);

  const aspectPresets = [
    { label: 'Free', ratio: null },
    { label: '1:1', ratio: 1 },
    { label: '4:3', ratio: 4 / 3 },
    { label: '16:9', ratio: 16 / 9 },
    { label: '3:2', ratio: 3 / 2 },
    { label: '9:16', ratio: 9 / 16 },
  ];

  const [selectedAspect, setSelectedAspect] = useState(null);

  const handleImageSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError('');
    if (selectedFile) {
      const info = await getImageInfo(selectedFile);
      setImgInfo(info);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      const margin = 0.1;
      setCropBox({
        x: Math.round(info.width * margin),
        y: Math.round(info.height * margin),
        w: Math.round(info.width * (1 - 2 * margin)),
        h: Math.round(info.height * (1 - 2 * margin)),
      });
    } else {
      setImgInfo(null);
      setPreviewUrl(null);
    }
  }, []);

  const applyAspectPreset = (ratio) => {
    setSelectedAspect(ratio);
    if (!imgInfo || !ratio) return;
    const maxW = imgInfo.width * 0.8;
    const maxH = imgInfo.height * 0.8;
    let w, h;
    if (maxW / ratio <= maxH) {
      w = Math.round(maxW);
      h = Math.round(maxW / ratio);
    } else {
      h = Math.round(maxH);
      w = Math.round(maxH * ratio);
    }
    setCropBox({
      x: Math.round((imgInfo.width - w) / 2),
      y: Math.round((imgInfo.height - h) / 2),
      w, h,
    });
  };

  // --- Mouse drag handlers for crop selection ---
  const getDisplayScale = () => {
    if (!imgInfo) return 1;
    const maxDisplayW = isMobile ? screenWidth - 64 : 700;
    const maxDisplayH = 400;
    return Math.min(maxDisplayW / imgInfo.width, maxDisplayH / imgInfo.height, 1);
  };
  const scale = getDisplayScale();

  const getImageCoords = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(imgInfo.width, (e.clientX - rect.left) / scale));
    const y = Math.max(0, Math.min(imgInfo.height, (e.clientY - rect.top) / scale));
    return { x, y };
  };

  const handleMouseDown = (e, mode = 'draw') => {
    e.preventDefault();
    e.stopPropagation();
    const coords = getImageCoords(e);
    setDragMode(mode);
    setDragStartPos(coords);
    
    if (mode === 'draw') {
      setDrawStart(coords);
      setCropBox({ x: coords.x, y: coords.y, w: 0, h: 0 });
    } else {
      setInitialCropBox({ ...cropBox });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragMode) return;
    e.preventDefault();
    const coords = getImageCoords(e);

    if (dragMode === 'draw') {
      let x = Math.min(drawStart.x, coords.x);
      let y = Math.min(drawStart.y, coords.y);
      let w = Math.abs(coords.x - drawStart.x);
      let h = Math.abs(coords.y - drawStart.y);

      if (selectedAspect && w > 5 && h > 5) {
        if (w / selectedAspect < h) h = w / selectedAspect;
        else w = h * selectedAspect;
      }
      setCropBox({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });

    } else if (dragMode === 'move') {
      const dx = coords.x - dragStartPos.x;
      const dy = coords.y - dragStartPos.y;
      let newX = initialCropBox.x + dx;
      let newY = initialCropBox.y + dy;

      newX = Math.max(0, Math.min(imgInfo.width - initialCropBox.w, newX));
      newY = Math.max(0, Math.min(imgInfo.height - initialCropBox.h, newY));
      
      setCropBox(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));

    } else {
      // Resizing
      const dx = coords.x - dragStartPos.x;
      const dy = coords.y - dragStartPos.y;
      let { x, y, w, h } = initialCropBox;

      if (dragMode.includes('n')) { y += dy; h -= dy; }
      if (dragMode.includes('s')) { h += dy; }
      if (dragMode.includes('w')) { x += dx; w -= dx; }
      if (dragMode.includes('e')) { w += dx; }

      // Handle flip
      if (w < 0) { x += w; w = Math.abs(w); }
      if (h < 0) { y += h; h = Math.abs(h); }

      // Enforce aspect ratio on resize
      if (selectedAspect && w > 5 && h > 5) {
        if (w / selectedAspect > h) {
          if (dragMode.includes('e') || dragMode.includes('w')) h = w / selectedAspect;
          else w = h * selectedAspect;
        } else {
          if (dragMode.includes('n') || dragMode.includes('s')) w = h * selectedAspect;
          else h = w / selectedAspect;
        }
      }

      x = Math.max(0, x);
      y = Math.max(0, y);
      if (x + w > imgInfo.width) w = imgInfo.width - x;
      if (y + h > imgInfo.height) h = imgInfo.height - y;

      setCropBox({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
    }
  };

  const handleMouseUp = () => {
    setDragMode(null);
    setDrawStart(null);
  };

  const handleCrop = async () => {
    if (!file) return;
    if (cropBox.w < 10 || cropBox.h < 10) {
      setError('Crop area is too small. Draw a larger selection.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const cropped = await cropImage(file, cropBox.x, cropBox.y, cropBox.w, cropBox.h);
      setResult(cropped);
    } catch (err) {
      setError('Crop failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getFileName = () => {
    if (!file) return 'shrinqe-cropped.jpg';
    const name = file.name.replace(/\.[^.]+$/, '');
    const ext = file.name.split('.').pop();
    return `shrinqe-${name}-cropped.${ext}`;
  };

  return (
    <ToolPageLayout
      title="Crop Image"
      description="Remove unwanted areas from your image. Click and drag on the preview to select your crop region, or use aspect ratio presets."
      icon="crop-outline"
      iconColor="#14B8A6"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />

      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && imgInfo && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Crop Settings</Text>

          {/* Aspect Presets */}
          <View style={styles.presetsRow}>
            <Text style={styles.presetsLabel}>Aspect Ratio</Text>
            <View style={styles.presetsGrid}>
              {aspectPresets.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => applyAspectPreset(p.ratio)}
                  style={[styles.presetChip, selectedAspect === p.ratio && styles.presetChipActive]}
                >
                  <Text style={[styles.presetChipText, selectedAspect === p.ratio && styles.presetChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Crop coordinates (read-only live display) */}
          <View style={styles.coordGrid}>
            {[
              { label: 'X', key: 'x' },
              { label: 'Y', key: 'y' },
              { label: 'Width', key: 'w' },
              { label: 'Height', key: 'h' },
            ].map(({ label, key }) => (
              <View key={key} style={styles.coordInput}>
                <Text style={styles.coordLabel}>{label}</Text>
                <input
                  type="number"
                  value={cropBox[key]}
                  onChange={(e) =>
                    setCropBox((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))
                  }
                  style={{
                    backgroundColor: Colors.bgInput,
                    color: Colors.textPrimary,
                    border: `1px solid ${Colors.border}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </View>
            ))}
          </View>

          {/* Visual Crop Preview with mouse selection */}
          {previewUrl && (
            <View style={styles.cropPreviewContainer}>
              <Text style={styles.previewLabel}>
                {dragMode ? '🖱️ Adjusting selection...' : '🖱️ Click & drag to select crop area'}
              </Text>
              <div
                ref={containerRef}
                onMouseDown={(e) => handleMouseDown(e, 'draw')}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  lineHeight: 0,
                  cursor: 'crosshair',
                  userSelect: 'none',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    width: imgInfo.width * scale,
                    height: imgInfo.height * scale,
                    borderRadius: 8,
                    opacity: 0.4,
                    pointerEvents: 'none',
                  }}
                />
                {/* Crop overlay */}
                {cropBox.w > 0 && cropBox.h > 0 && (
                  <div
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                    style={{
                      position: 'absolute',
                      left: cropBox.x * scale,
                      top: cropBox.y * scale,
                      width: cropBox.w * scale,
                      height: cropBox.h * scale,
                      border: '2px dashed #7C3AED',
                      backgroundColor: 'transparent',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                      borderRadius: 4,
                      cursor: 'move',
                    }}
                  >
                    {/* Corner handles */}
                    {[
                      { mode: 'nw', top: -6, left: -6, cursor: 'nwse-resize' },
                      { mode: 'ne', top: -6, right: -6, cursor: 'nesw-resize' },
                      { mode: 'sw', bottom: -6, left: -6, cursor: 'nesw-resize' },
                      { mode: 'se', bottom: -6, right: -6, cursor: 'nwse-resize' },
                    ].map((pos) => (
                      <div
                        key={pos.mode}
                        onMouseDown={(e) => handleMouseDown(e, pos.mode)}
                        style={{
                          position: 'absolute',
                          top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right,
                          width: 12, height: 12,
                          backgroundColor: '#14B8A6',
                          border: '2px solid #fff',
                          borderRadius: '50%',
                          cursor: pos.cursor,
                          zIndex: 10,
                        }}
                      />
                    ))}
                    {/* Dimension label inside crop */}
                    <div style={{
                      position: 'absolute', bottom: 4, right: 6,
                      fontSize: 10, color: '#fff', fontFamily: 'Inter, sans-serif',
                      fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                      pointerEvents: 'none',
                    }}>
                      {cropBox.w}×{cropBox.h}
                    </div>
                  </div>
                )}
              </div>
            </View>
          )}

          <View style={styles.actionRow}>
            <button
              onClick={handleCrop}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #14B8A6, #3B82F6)',
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
              {processing ? '⏳ Cropping...' : '✂️ Crop Image'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Cropped Successfully</Text>
            <Text style={styles.resultDim}>
              New dimensions: {result.width} × {result.height}px
            </Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Cropped"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName={getFileName()}
              size={result.blob.size}
              label="Download Cropped"
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
  presetsRow: { gap: Spacing.sm },
  presetsLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetChip: {
    backgroundColor: Colors.bgTertiary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md + 4,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  presetChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  presetChipText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textSecondary },
  presetChipTextActive: { color: Colors.primaryLight },
  coordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  coordInput: { width: 100, gap: Spacing.xs },
  coordLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cropPreviewContainer: { gap: Spacing.sm, alignItems: 'center' },
  previewLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, alignSelf: 'flex-start' },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  resultDim: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
