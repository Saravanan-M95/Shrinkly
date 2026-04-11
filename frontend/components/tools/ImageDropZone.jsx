import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { formatFileSize } from '../../services/imageProcessor';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];

export default function ImageDropZone({ onImageSelect, currentImage, accept = ACCEPTED_TYPES, multiple = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const animateDrop = (dragging) => {
    Animated.spring(scaleAnim, {
      toValue: dragging ? 1.02 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsDragging(dragging);
  };

  const handleFile = useCallback((file) => {
    if (!file) return;

    // Validate type
    if (!accept.includes(file.type) && !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  }, [onImageSelect, accept]);

  const handleFiles = useCallback((files) => {
    if (multiple) {
      Array.from(files).forEach(handleFile);
    } else {
      handleFile(files[0]);
    }
  }, [handleFile, multiple]);

  const handleClick = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    animateDrop(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    animateDrop(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    animateDrop(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setFileInfo(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const webProps = Platform.OS === 'web' ? {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  } : {};

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleClick}
          activeOpacity={0.8}
          style={styles.touchable}
        >
          <View
            {...webProps}
            style={[
              styles.dropZone,
              isDragging && styles.dropZoneDragging,
              preview && styles.dropZoneWithPreview,
              isMobile && styles.dropZoneMobile,
            ]}
          >
            {preview ? (
              <View style={styles.previewContainer}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: isMobile ? 200 : 300,
                    borderRadius: 12,
                    objectFit: 'contain',
                  }}
                />
                <View style={styles.fileInfoBar}>
                  <View style={styles.fileInfoLeft}>
                    <Ionicons name="image-outline" size={16} color={Colors.primaryLight} />
                    <Text style={styles.fileName} numberOfLines={1}>{fileInfo?.name}</Text>
                  </View>
                  <Text style={styles.fileSize}>{formatFileSize(fileInfo?.size || 0)}</Text>
                </View>
                <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                  <Text style={styles.clearText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  style={styles.uploadIconBg}
                >
                  <Ionicons
                    name={isDragging ? 'cloud-download-outline' : 'cloud-upload-outline'}
                    size={36}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={styles.dropTitle}>
                  {isDragging ? 'Drop image here!' : 'Drag & drop your image'}
                </Text>
                <Text style={styles.dropSubtitle}>
                  or click to browse files
                </Text>
                <View style={styles.formatBadges}>
                  {['JPG', 'PNG', 'WEBP', 'GIF', 'SVG'].map((fmt) => (
                    <View key={fmt} style={styles.formatBadge}>
                      <Text style={styles.formatBadgeText}>{fmt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
  dropZone: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bgCard,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  dropZoneMobile: {
    padding: Spacing.xl,
    minHeight: 200,
  },
  dropZoneDragging: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderStyle: 'solid',
  },
  dropZoneWithPreview: {
    borderStyle: 'solid',
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  uploadIconBg: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  dropTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dropSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  formatBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  formatBadge: {
    backgroundColor: Colors.bgTertiary,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  formatBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  previewContainer: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.md,
  },
  fileInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  fileInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  fileName: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  fileSize: {
    fontSize: FontSizes.sm,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  clearText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    fontWeight: '600',
  },
});
