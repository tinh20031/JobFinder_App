import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const GoogleSignInButton = ({ onPress, loading, disabled, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#e94235" size="small" />
      ) : (
        <>
          <MaterialIcons name="mail" size={20} color="#e94235" style={styles.icon} />
          <Text style={[styles.text, textStyle]}>Log In via Gmail</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e94235',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#e94235',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GoogleSignInButton; 