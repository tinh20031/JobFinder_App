import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const NotFoundScreen = ({ 
  title = "Not Found", 
  message = "Sorry, the keyword you entered cannot be found, please check again or search with another keyword.",
  useImage = true,
  imageSource = require('../images/notfound.png'),
  imageWidth = 280,
  imageHeight = 200,
  imageResizeMode = "contain", 
  iconName = "sentiment-dissatisfied",
  iconSize = 80,
  iconColor = "#ccc",
  variant = "default" 
}) => {

    const iconVariants = {
    default: { name: "sentiment-dissatisfied", color: "#ff6b6b" },
    sad: { name: "sentiment-very-dissatisfied", color: "#ff6b6b" },
    confused: { name: "help-outline", color: "#ffa726" },
    empty: { name: "inbox", color: "#90a4ae" },
    search: { name: "search-off", color: "#90a4ae" },
    work: { name: "work-off", color: "#ff6b6b" }
  };

  // Use variant if provided, otherwise use custom props
  const finalIconName = variant && iconVariants[variant] ? iconVariants[variant].name : iconName;
  const finalIconColor = variant && iconVariants[variant] ? iconVariants[variant].color : iconColor;
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        {useImage ? (
          <Image 
            source={imageSource}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            resizeMode={imageResizeMode}
            onError={(error) => {
              console.log('Image loading error:', error);
            }}
          />
        ) : (
          <MaterialIcons name={finalIconName} size={iconSize} color={finalIconColor} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  illustration: {
    marginBottom: 12,
    alignItems: 'center',
  },
  image: {
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    color: '#333',
    marginBottom: 0,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
});

export default NotFoundScreen; 