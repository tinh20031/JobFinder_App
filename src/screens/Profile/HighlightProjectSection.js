import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HighlightProjectSection({ onAdd }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="lightbulb-on-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Highlight Project</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#ff9228" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.separator} />
      <Text style={styles.emptyText}>No highlight project added yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontWeight: 'bold', fontSize: 16, color: '#150b3d', flex: 1 },
  addBtn: {
    backgroundColor: '#fff6f2',
    borderRadius: 20,
    padding: 4,
    marginLeft: 8,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  separator: { height: 1, backgroundColor: '#eee', marginBottom: 12 },
  emptyText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 12 },
}); 