import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const HeaderDetail = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="#191970" />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={styles.iconBtn}>
        <MaterialIcons name="more-vert" size={28} color="#191970" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e3eafc',
    // elevation: 2, // nếu muốn bóng
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },
});

export default HeaderDetail; 