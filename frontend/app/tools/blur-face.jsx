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
import { blurRegions, getImageInfo } from '../../services/imageProcessor';

export default function BlurFaceTool() {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  const [file, setFile] = useState(null);
  const [imgInfo, setImgInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [regions, setRegions] = useState([]);
  const [intensity, setIntensity] = useState(15);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mouse drag state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawCurrent, setDrawCurrent] = useState(null);
  const containerRef = useRef(null);

  const handleImageSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setRegions([]);
    setError('');
    if (selectedFile) {
      const info = await getImageInfo(selectedFile);
      setImgInfo(info);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setImgInfo(null);
      setPreviewUrl(null);
    }
  }, []);

  const getScale = () => {
    if (!imgInfo) return 1;
    const maxW = isMobile ? screenWidth - 80 : 650;
    const maxH = 400;
    return Math.min(maxW / imgInfo.width, maxH / imgInfo.height, 1);
  };

  const scale = getScale();

  const getImageCoords = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(imgInfo.width, (e.clientX - rect.left) / scale));
    const y = Math.max(0, Math.min(imgInfo.height, (e.clientY - rect.top) / scale));
    return { x, y };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const coords = getImageCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    setDrawCurrent(coords);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;
    e.preventDefault();
    const coords = getImageCoords(e);
    setDrawCurrent(coords);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !drawStart || !drawCurrent) {
      setIsDrawing(false);
      return;
    }

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);

    if (w > 10 && h > 10) {
      setRegions(prev => [...prev, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(w),
        height: Math.round(h),
      }]);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const removeRegion = (index) => {
    setRegions(prev => prev.filter((_, i) => i !== index));
  };

  const handleBlur = async () => {
    if (!file || regions.length === 0) return;
    setProcessing(true);
    setError('');
    try {
      const blurred = await blurRegions(file, regions, intensity);
      setResult(blurred);
    } catch (err) {
      setError('Blur failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Compute the live drawing rectangle
  const liveRect = (isDrawing && drawStart && drawCurrent) ? {
    x: Math.min(drawStart.x, drawCurrent.x),
    y: Math.min(drawStart.y, drawCurrent.y),
    width: Math.abs(drawCurrent.x - drawStart.x),
    height: Math.abs(drawCurrent.y - drawStart.y),
  } : null;

  return (
    <ToolPageLayout
      title="Blur Face"
      description="Protect privacy by blurring faces or sensitive areas. Click and drag on the image to draw blur regions."
      icon="eye-off-outline"
      iconColor="#EF4444"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />

      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && imgInfo && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Draw Blur Regions</Text>
          <Text style={styles.hint}>
            {isDrawing ? '🖱️ Drawing... release to confirm' : '🖱️ Click and drag on the image to select areas to blur'}
          </Text>

          {/* Interactive canvas */}
          <View style={styles.canvasContainer}>
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                position: 'relative',
                display: 'inline-block',
                cursor: 'crosshair',
                userSelect: 'none',
                lineHeight: 0,
              }}
            >
              <img
                src={previewUrl}
                alt="Target"
                draggable={false}
                style={{
                  width: imgInfo.width * scale,
                  height: imgInfo.height * scale,
                  borderRadius: 8,
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />

              {/* Existing saved regions */}
              {regions.map((region, i) => (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); removeRegion(i); }}
                  title="Click to remove"
                  style={{
                    position: 'absolute',
                    left: region.x * scale,
                    top: region.y * scale,
                    width: region.width * scale,
                    height: region.height * scale,
                    border: '2px solid #EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#EF4444',
                    fontWeight: 700,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  ✕
                </div>
              ))}

              {/* Live drawing rectangle */}
              {liveRect && liveRect.width > 5 && liveRect.height > 5 && (
                <div
                  style={{
                    position: 'absolute',
                    left: liveRect.x * scale,
                    top: liveRect.y * scale,
                    width: liveRect.width * scale,
                    height: liveRect.height * scale,
                    border: '2px dashed #F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 4,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </View>

          {regions.length > 0 && (
            <Text style={styles.regionCount}>
              {regions.length} region{regions.length > 1 ? 's' : ''} selected
              <Text style={styles.regionHint}> (click a region to remove it)</Text>
            </Text>
          )}

          {/* Intensity */}
          <View style={styles.sliderGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Blur Intensity</Text>
              <Text style={styles.sliderValue}>{intensity}</Text>
            </View>
            <input
              type="range"
              min="5"
              max="40"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#EF4444', height: 6, cursor: 'pointer' }}
            />
          </View>

          <View style={styles.actionRow}>
            <button
              onClick={handleBlur}
              disabled={processing || regions.length === 0}
              style={{
                background: processing || regions.length === 0 ? Colors.bgTertiary : 'linear-gradient(135deg, #EF4444, #7C3AED)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: processing || regions.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {processing ? '⏳ Blurring...' : '🔲 Apply Blur'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Faces Blurred</Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Blurred"
                style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName="shrinqe-blurred.jpg"
              size={result.blob.size}
              label="Download Blurred"
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
  hint: { fontSize: FontSizes.sm, color: Colors.textMuted },
  canvasContainer: { alignItems: 'center' },
  regionCount: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  regionHint: { fontSize: FontSizes.xs, color: Colors.textMuted, fontWeight: '400' },
  sliderGroup: { gap: Spacing.sm },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  sliderValue: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.primaryLight },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
