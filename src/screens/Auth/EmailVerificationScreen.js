import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { authService } from '../../services/authService';
import Header from '../../components/Header';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.verifyEmail(email, code);
      setSuccess('Email verified successfully! You can now log in.');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err) {
      setError(err.data?.message || err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.resendVerification(email);
      setResent(true);
      setSuccess('Verification code resent. Please check your email.');
    } catch (err) {
      setError(err.data?.message || err.message || 'Resend failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Create a JobFinder Account</Text>
        <View style={styles.successBox}>
          <Text style={styles.successText}>Registration successful. Please check your email to verify your account.</Text>
        </View>
        <Text style={styles.label2}>Enter the verification code sent to your email</Text>
        <TextInput
          style={styles.input}
          placeholder="Verification code"
          value={code}
          onChangeText={setCode}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Email authentication</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResend} disabled={loading || resent}>
          <Text style={styles.resendLink}>Resend verification code</Text>
        </TouchableOpacity>
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>LogIn</Text>
        </Text>
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
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 18,
    textAlign: 'left',
  },
  successBox: {
    backgroundColor: '#d1f5dd',
    borderRadius: 6,
    padding: 16,
    marginBottom: 18,
  },
  successText: {
    color: '#217a3c',
    fontSize: 15,
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
  },
  label2: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    marginLeft: 2,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    borderWidth: 0,
    backgroundColor: '#f2f6ff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
  },
  success: {
    color: 'green',
    marginBottom: 12,
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
  },
  verifyBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  resendLink: {
    color: '#2563eb',
    textAlign: 'left',
    marginBottom: 18,
    marginTop: 2,
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Regular',
  },
  loginText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#444',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  loginLink: {
    color: '#2563eb',
    fontFamily: 'Poppins-Regular',
  },
});

export default EmailVerificationScreen; 