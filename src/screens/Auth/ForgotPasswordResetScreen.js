import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { authService } from '../../services/authService';
import Header from '../../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ForgotPasswordResetScreen = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [step, setStep] = useState(1); // 1: verify code, 2: reset password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.forgotPasswordVerify(email, code);
      setSuccess('Code verified. Please enter your new password.');
      setStep(2);
    } catch (err) {
      let detailMsg = err?.data?.message || err?.message || 'Invalid code.';
      if (
        (err?.response?.status === 400 || /400/.test(detailMsg)) &&
        (!err?.data?.message && !err?.response?.data?.message)
      ) {
        detailMsg = 'The verification code is incorrect or has expired.';
      }
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please enter both passwords.');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.forgotPasswordReset(email, code, newPassword);
      setSuccess('Password reset successfully. You can now log in.');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.forgotPasswordResendVerification(email);
      setSuccess('Verification code resent.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
      <Header />
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Reset Password</Text>
        
        {step === 1 ? (
          <>
            <Text style={styles.subtitle}>
              Enter the verification code sent to your email address.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}
            
            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
              onPress={handleVerify} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Verify Code</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resendBtn} 
              onPress={handleResend} 
              disabled={loading}
            >
              <Text style={styles.resendBtnText}>Resend Code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Enter your new password below.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}
            
            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
              onPress={handleReset} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember your password?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
              Back to Login
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  success: {
    color: '#2e7d32',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendBtn: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendBtnText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    color: '#1976d2',
    fontWeight: '600',
  },
});

export default ForgotPasswordResetScreen; 