import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.verifyOtp(email, otp);
      if (res.success) {
        router.push({
          pathname: '/auth/reset-password',
          params: { email, otp },
        });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Card variant="glass" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={48} color={Colors.success} />
        </View>
        
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to <Text style={styles.emailText}>{email}</Text>.
        </Text>

        <Input
          label="Verification Code"
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          icon={<Ionicons name="key-outline" size={20} color={Colors.textMuted} />}
        />

        <Button
          title="Verify Code"
          onPress={handleVerify}
          loading={isLoading}
          style={styles.submitBtn}
        />

        <TouchableOpacity 
          style={styles.resendBtn} 
          onPress={() => router.back()}
        >
          <Text style={styles.resendText}>Didn't receive a code? <Text style={styles.resendHighlight}>Re-send</Text></Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.xl, paddingTop: 60, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.xl },
  card: { width: '100%', maxWidth: 450, padding: Spacing.xl, alignItems: 'center' },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  emailText: { color: Colors.textPrimary, fontWeight: '700' },
  submitBtn: { width: '100%', marginTop: Spacing.md },
  resendBtn: { marginTop: Spacing.xl },
  resendText: { color: Colors.textMuted, fontSize: FontSizes.sm },
  resendHighlight: { color: Colors.primary, fontWeight: '700' },
});
