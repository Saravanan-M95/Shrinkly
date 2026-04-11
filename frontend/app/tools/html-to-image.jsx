import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import ToolPageLayout from '../../components/tools/ToolPageLayout';
import DownloadButton from '../../components/tools/DownloadButton';
import AlertToast from '../../components/tools/AlertToast';
import Card from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { htmlToImage } from '../../services/imageProcessor';

const SAMPLE_HTML = `<div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; color: white; font-family: 'Inter', sans-serif;">
  <h1 style="margin: 0 0 16px 0; font-size: 36px; font-weight: 900;">Hello, World!</h1>
  <p style="margin: 0; font-size: 18px; opacity: 0.9;">This HTML will be converted to an image.</p>
</div>`;

export default function HTMLToImageTool() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [html, setHtml] = useState(SAMPLE_HTML);
  const [imgWidth, setImgWidth] = useState(800);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!html.trim()) return;
    setProcessing(true);
    try {
      const converted = await htmlToImage(html, {
        width: imgWidth,
        backgroundColor: bgColor,
      });
      setResult(converted);
    } catch (err) {
      setError('Conversion failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="HTML to Image"
      description="Convert HTML & CSS code into a downloadable image. Perfect for creating social cards, code screenshots, and visual content."
      icon="code-slash-outline"
      iconColor="#14B8A6"
    >
      <AlertToast visible={!!error} message={error} type="error" onDismiss={() => setError('')} />
      <Card variant="glass" style={styles.controls}>
        <Text style={styles.controlsTitle}>HTML Code</Text>

        {/* HTML Editor */}
        <View style={styles.editorContainer}>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste your HTML code here..."
            spellCheck={false}
            style={{
              backgroundColor: Colors.bgInput,
              color: '#E2E8F0',
              border: `1px solid ${Colors.border}`,
              borderRadius: 12,
              padding: 16,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              outline: 'none',
              width: '100%',
              minHeight: 200,
              resize: 'vertical',
              lineHeight: 1.6,
              tabSize: 2,
            }}
          />
        </View>

        {/* Settings row */}
        <View style={[styles.settingsRow, isMobile && styles.settingsRowMobile]}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Image Width</Text>
            <input
              type="number"
              value={imgWidth}
              onChange={(e) => setImgWidth(Number(e.target.value))}
              style={{
                backgroundColor: Colors.bgInput,
                color: Colors.textPrimary,
                border: `1px solid ${Colors.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                width: isMobile ? '100%' : 120,
              }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Background</Text>
            <View style={styles.colorPickerRow}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: 40, height: 36, cursor: 'pointer', border: 'none', borderRadius: 6 }}
              />
              <Text style={styles.colorValue}>{bgColor}</Text>
            </View>
          </View>
        </View>

        {/* Live HTML Preview */}
        {html.trim() && (
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Live Preview</Text>
            <div
              style={{
                backgroundColor: bgColor,
                borderRadius: 12,
                padding: 0,
                maxWidth: '100%',
                overflow: 'auto',
                border: `1px solid ${Colors.borderLight}`,
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </View>
        )}

        <View style={styles.actionRow}>
          <button
            onClick={handleConvert}
            disabled={processing || !html.trim()}
            style={{
              background: processing ? Colors.bgTertiary : 'linear-gradient(135deg, #14B8A6, #3B82F6)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              cursor: processing || !html.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {processing ? '⏳ Converting...' : '📸 Convert to Image'}
          </button>
        </View>
      </Card>

      {result && (
        <View style={styles.resultSection}>
          <Card variant="glass" style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Converted Successfully</Text>
            <Text style={styles.resultDim}>
              {result.width} × {result.height}px
            </Text>
            <View style={styles.resultPreview}>
              <img
                src={result.url}
                alt="HTML rendered"
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, objectFit: 'contain' }}
              />
            </View>
          </Card>
          <View style={styles.downloadRow}>
            <DownloadButton
              blob={result.blob}
              fileName="shrinqe-html-to-image.png"
              size={result.blob.size}
              label="Download Image"
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
  editorContainer: { width: '100%' },
  settingsRow: { flexDirection: 'row', gap: Spacing.xl },
  settingsRowMobile: { flexDirection: 'column', gap: Spacing.lg },
  settingItem: { gap: Spacing.sm },
  settingLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  colorPickerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  colorValue: { fontSize: FontSizes.sm, color: Colors.textMuted, fontFamily: 'monospace' },
  previewSection: { gap: Spacing.sm },
  previewLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  actionRow: { alignItems: 'flex-start', marginTop: Spacing.sm },
  resultSection: { marginTop: Spacing.xl, gap: Spacing.lg },
  resultCard: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  resultDim: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  resultPreview: { alignItems: 'center', width: '100%' },
  downloadRow: { alignItems: 'center' },
});
