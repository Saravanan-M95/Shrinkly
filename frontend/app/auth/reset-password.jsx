import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.resetPassword(email, otp, password);
      if (res.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Card variant="glass" style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
            </View>
            
            <Text style={styles.title}>Password Reset!</Text>
            <Text style={styles.subtitle}>
              Your password has been reset successfully. You can now use your new password to sign in to your account.
            </Text>

            <Button
              title="Back to Login"
              onPress={() => router.replace('/login')}
              style={styles.submitBtn}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card variant="glass" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open-outline" size={48} color={Colors.warning} />
        </View>
        
        <Text style={styles.title}>New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password that you haven't used before.
        </Text>

        <Input
          label="New Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />}
        />

        <Input
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          secureTextEntry
          icon={<Ionicons name="shield-outline" size={20} color={Colors.textMuted} />}
        />

        <Button
          title="Reset Password"
          onPress={handleReset}
          loading={isLoading}
          style={styles.submitBtn}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.xl, paddingTop: 80, alignItems: 'center' },
  card: { width: '100%', maxWidth: 450, padding: Spacing.xl, alignItems: 'center' },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  submitBtn: { width: '100%', marginTop: Spacing.md },
});
