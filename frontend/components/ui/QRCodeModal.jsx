import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Image,
  Platform, useWindowDimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function QRCodeModal({ visible, onClose, link }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!link) return null;

  const handleDownload = async () => {
    if (Platform.OS === 'web') {
      const linkElement = document.createElement('a');
      linkElement.href = link.qrCode;
      linkElement.download = `shrinQE-qr-${link.shortCode}.png`;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
    } else {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          const fileUri = `${FileSystem.cacheDirectory}shrinQE-qr-${link.shortCode}.png`;
          const base64Data = link.qrCode.split('base64,')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
          await Sharing.shareAsync(fileUri);
        } else {
          alert('Sharing is not available on this device');
        }
      } catch (error) {
        console.error('Error sharing QR code:', error);
        alert('Failed to share QR code');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, isMobile && styles.modalContainerMobile]}>
          <View style={styles.header}>
            <Text style={styles.title}>QR Code</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.linkTitle} numberOfLines={1}>{link.title || 'Untitled Link'}</Text>
            <Text style={styles.linkUrl} numberOfLines={1}>{link.shortUrl}</Text>

            <View style={styles.qrWrapper}>
              {link.qrCode ? (
                <Image
                  source={{ uri: link.qrCode }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <ActivityIndicator size="large" color={Colors.primary} />
              )}
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.infoText}>Scan this code to go directly to your link.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
            <Ionicons name={Platform.OS === 'web' ? "download-outline" : "share-outline"} size={20} color="#fff" />
            <Text style={styles.downloadBtnText}>
              {Platform.OS === 'web' ? 'Download PNG' : 'Share QR Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 400,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainerMobile: {
    maxWidth: '95%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  linkTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  linkUrl: {
    fontSize: FontSizes.sm,
    color: Colors.primaryLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrWrapper: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.bgTertiary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  infoText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  downloadBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
});
