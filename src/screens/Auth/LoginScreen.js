import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../../services/authService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
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

  const handleGmailLogin = () => {
    // Xử lý đăng nhập bằng Gmail ở đây
    Alert.alert('Chức năng đang phát triển');
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
        <TouchableOpacity style={styles.gmailBtn} onPress={handleGmailLogin}>
          <MaterialIcons name="mail" size={20} color="#e94235" style={{ marginRight: 8 }} />
          <Text style={styles.gmailBtnText}>Log In via Gmail</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e94235',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    marginTop: 20,
  },
  gmailBtnText: {
    color: '#e94235',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
