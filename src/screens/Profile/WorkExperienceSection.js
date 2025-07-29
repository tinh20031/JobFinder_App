import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function WorkExperienceSection({ works = [], onAdd, onEdit }) {
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
        <Icon name="briefcase-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Work experience</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#ff9228" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.separator} />
      {(!works || works.length === 0) ? (
        <Text style={styles.emptyText}>No work experience added yet.</Text>
      ) : (
        <>
          {works.map((item, idx) => {
            const start = formatMonthYear(item.monthStart);
            const end = item.isWorking ? 'Now' : formatMonthYear(item.monthEnd);
            let duration = '';
            if (item.monthStart && item.monthEnd && !item.isWorking) {
              duration = calcDuration(item.monthStart, item.monthEnd);
            }
            return (
              <View style={styles.workItem} key={item.workExperienceId || idx}>
                <View style={{ flex: 1 }}>
                  {item.jobTitle ? <Text style={styles.workTitle}>{item.jobTitle}</Text> : null}
                  {item.companyName ? <Text style={styles.workCompany}>{item.companyName}</Text> : null}
                  {(start || end) && (
                    <Text style={styles.workTime}>
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
  workItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  workTitle: { fontWeight: 'bold', fontSize: 16, color: '#150b3d', marginBottom: 2 },
  workCompany: { fontSize: 14, color: '#514a6b', marginBottom: 2 },
  workTime: { fontSize: 13, color: '#514a6b', marginBottom: 2 },
  moreBtn: { marginLeft: 8, padding: 4, alignSelf: 'flex-start' },
}); 