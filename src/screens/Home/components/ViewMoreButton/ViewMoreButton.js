import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ViewMoreButton = ({ isPressed, onPressIn, onPressOut, onPress }) => {
  return (
    <View style={styles.viewMoreContainer}>
      <TouchableOpacity 
        style={[
          styles.viewMoreButton,
          isPressed && styles.viewMoreButtonPressed
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <Text style={[
          styles.viewMoreText,
          isPressed && styles.viewMoreTextPressed
        ]}>
          View More
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  viewMoreContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
  },
  viewMoreButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewMoreText: {
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  viewMoreButtonPressed: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  viewMoreTextPressed: {
    color: '#fff',
  },
});

export default ViewMoreButton; 