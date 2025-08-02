import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../../services/authService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { googleAuthService } from '../../services/googleAuthService';
import GoogleSignInButton from '../../components/GoogleSignInButton';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Khởi tạo Google Sign-In
  React.useEffect(() => {
    googleAuthService.configure();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'Token not saved! Please try again.');
        setLoading(false);
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      });
    } catch (err) {
      if (err.isUnverifiedEmail) {
        setError('Your email is not verified. Please check your inbox.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGmailLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      // Sử dụng service để xử lý đăng nhập Google
      const data = await googleAuthService.handleGoogleLogin();
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'Token not saved! Please try again.');
        setGoogleLoading(false);
        return;
      }

      // Chuyển hướng đến màn hình chính
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        setError('Google sign-in was cancelled.');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        setError('Google Play Services not available.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Login to JobFinder</Text>
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
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.rowBetween}>
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <MaterialIcons name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Quên mật khẩu?', 'Chức năng đang phát triển')}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Log In</Text>}
        </TouchableOpacity>
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>Signup</Text>
        </Text>
        <GoogleSignInButton
          onPress={handleGmailLogin}
          loading={googleLoading}
          style={styles.gmailBtn}
        />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 0,
    backgroundColor: '#f2f6ff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 4,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
  },
  forgot: {
    color: '#2563eb',
    fontSize: 14,
    // không in đậm
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 16,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#444',
    fontSize: 15,
  },
  signupLink: {
    color: '#2563eb',
    // không in đậm
  },
  gmailBtn: {
    marginTop: 20,
  },
});

export default LoginScreen;
