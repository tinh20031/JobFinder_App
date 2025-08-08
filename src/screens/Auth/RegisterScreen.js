import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { authService } from '../../services/authService';
import Header from '../../components/Header';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must be at least 8 characters, including letters and numbers.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.register(fullName, email, phone, password);
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => navigation.navigate('EmailVerification', { email }), 1500);
    } catch (err) {
      console.log('Registration error:', err);
      setError(
        err.data?.message ||
        err.message ||
        (typeof err.data === 'object' ? JSON.stringify(err.data) : '') ||
        'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#f8f9fb'}} contentContainerStyle={{flexGrow: 1}}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Create a JobFinder Account</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Register</Text>}
        </TouchableOpacity>
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>LogIn</Text>
        </Text>
      </View>
    </ScrollView>
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
    marginBottom: 24,
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
    marginLeft: 2,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    borderWidth: 0,
    backgroundColor: '#f2f6ff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
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
  registerBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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

export default RegisterScreen; 