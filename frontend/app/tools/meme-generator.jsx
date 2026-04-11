import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import ToolPageLayout from '../../components/tools/ToolPageLayout';
import ImageDropZone from '../../components/tools/ImageDropZone';
import DownloadButton from '../../components/tools/DownloadButton';
import AlertToast from '../../components/tools/AlertToast';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { generateMeme } from '../../services/imageProcessor';

export default function MemeGeneratorTool() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [file, setFile] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(0); // 0 = auto
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
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

  const handleGenerate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const meme = await generateMeme(file, topText, bottomText, {
        fontSize: fontSize || null,
        fontColor,
        strokeColor,
      });
      setResult(meme);
    } catch (err) {
      setError('Meme generation failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Meme Generator"
      description="Create viral memes in seconds. Add top and bottom text with classic meme styling — Impact font, white text, black outline."
      icon="happy-outline"
      iconColor="#F59E0B"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <ImageDropZone onImageSelect={handleImageSelect} />

      {file && (
        <Card variant="glass" style={styles.controls}>
          <Text style={styles.controlsTitle}>Meme Text</Text>

          {/* Top Text */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Top Text</Text>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="TOP TEXT GOES HERE..."
              style={{
                backgroundColor: Colors.bgInput,
                color: Colors.textPrimary,
                border: `1px solid ${Colors.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                fontFamily: 'Impact, Arial Black, sans-serif',
                outline: 'none',
                width: '100%',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            />
          </View>

          {/* Bottom Text */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bottom Text</Text>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="BOTTOM TEXT GOES HERE..."
              style={{
                backgroundColor: Colors.bgInput,
                color: Colors.textPrimary,
                border: `1px solid ${Colors.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                fontFamily: 'Impact, Arial Black, sans-serif',
                outline: 'none',
                width: '100%',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            />
          </View>

          {/* Font Size */}
          <View style={styles.inputGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.inputLabel}>Font Size</Text>
              <Text style={styles.sliderValue}>{fontSize === 0 ? 'Auto' : `${fontSize}px`}</Text>
            </View>
            <input
              type="range"
              min="0"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#F59E0B', height: 6, cursor: 'pointer' }}
            />
            <Text style={styles.hint}>Set to 0 for automatic sizing</Text>
          </View>

          {/* Live meme preview */}
          {previewUrl && (topText || bottomText) && (
            <View style={styles.memePreview}>
              <Text style={styles.previewLabel}>Live Preview</Text>
              <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
                <img
                  src={previewUrl}
                  alt="Meme base"
                  style={{
                    maxWidth: '100%',
                    maxHeight: isMobile ? 250 : 350,
                    borderRadius: 8,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                {topText && (
                  <div style={{
                    position: 'absolute', top: 10, left: 0, right: 0,
                    textAlign: 'center', fontFamily: 'Impact, Arial Black, sans-serif',
                    fontSize: fontSize || 28, color: fontColor, textTransform: 'uppercase',
                    WebkitTextStroke: `2px ${strokeColor}`, padding: '0 10px',
                    wordWrap: 'break-word', lineHeight: 1.2,
                  }}>
                    {topText}
                  </div>
                )}
                {bottomText && (
                  <div style={{
                    position: 'absolute', bottom: 10, left: 0, right: 0,
                    textAlign: 'center', fontFamily: 'Impact, Arial Black, sans-serif',
                    fontSize: fontSize || 28, color: fontColor, textTransform: 'uppercase',
                    WebkitTextStroke: `2px ${strokeColor}`, padding: '0 10px',
                    wordWrap: 'break-word', lineHeight: 1.2,
                  }}>
                    {bottomText}
                  </div>
                )}
              </div>
            </View>
          )}

          <View style={styles.actionRow}>
            <button
              onClick={handleGenerate}
              disabled={processing}
              style={{
                background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #F59E0B, #EF4444)',
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
              {processing ? '⏳ Generating...' : '😂 Generate Meme'}
            </button>
          </View>
        </Card>
      )}

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎉 Meme Ready!</Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="Generated meme"
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName="shrinqe-meme.jpg"
              size={result.blob.size}
              label="Download Meme"
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
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderValue: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.primaryLight },
  hint: { fontSize: FontSizes.xs, color: Colors.textMuted, fontStyle: 'italic' },
  memePreview: {
    gap: Spacing.sm, alignItems: 'center', backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.md, padding: Spacing.lg,
  },
  previewLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, alignSelf: 'flex-start' },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
