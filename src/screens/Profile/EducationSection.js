import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EducationSection({ educations, onAdd, onEdit }) {
  // Helper: parse date string 'YYYY-MM-01' => 'Mon YYYY'
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function formatMonthYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }
  function calcDuration(start, end) {
    if (!start || !end) return '';
    const d1 = new Date(start);
    const d2 = new Date(end);
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years < 0) return '';
    if (years === 0) return `${months} Months`;
    if (months === 0) return `${years} Years`;
    return `${years} Years`;
  }
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="school-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Education</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Icon name="plus" size={18} color="#ff9228" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      {(!educations || educations.length === 0) ? (
        <Text style={styles.emptyText}>No education added yet.</Text>
      ) : (
        <>
          {educations.map((item, idx) => {
            const start = formatMonthYear(item.monthStart);
            const end = item.isStudying ? 'Now' : formatMonthYear(item.monthEnd);
            let duration = '';
            if (item.monthStart && item.monthEnd && !item.isStudying) {
              duration = calcDuration(item.monthStart, item.monthEnd);
            }
            return (
              <View style={styles.eduItem} key={item.educationId || item.id || idx}>
                <View style={{ flex: 1 }}>
                  {item.major ? <Text style={styles.eduMajor}>{item.major}</Text> : null}
                  {item.school ? <Text style={styles.eduSchool}>{item.school}</Text> : null}
                  {(start || end) && (
                    <Text style={styles.eduTime}>
                      {start} - {end}{duration ? ` · ${duration}` : ''}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.moreBtn} onPress={() => onEdit(item)}>
                  <Icon name="pencil" size={20} color="#ff9228" />
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}
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
  eduItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  eduMajor: { fontWeight: 'bold', fontSize: 16, color: '#150b3d', marginBottom: 2 },
  eduSchool: { fontSize: 14, color: '#514a6b', marginBottom: 2 },
  eduTime: { fontSize: 13, color: '#514a6b', marginBottom: 2 },
  eduDesc: { fontSize: 12, color: '#514a6b', marginTop: 2 },
  moreBtn: { marginLeft: 8, padding: 4, alignSelf: 'flex-start' }
}); 