import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function EducationSection({ educations, onAdd, onEdit, onDelete }) {
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

  const EducationItem = ({ item, index }) => {
    const start = formatMonthYear(item.monthStart);
    const end = item.isStudying ? 'Now' : formatMonthYear(item.monthEnd);
    let duration = '';
    if (item.monthStart && item.monthEnd && !item.isStudying) {
      duration = calcDuration(item.monthStart, item.monthEnd);
    }

    return (
      <View style={styles.eduItem}>
        <View style={styles.eduIconContainer}>
          <Icon name="school" size={20} color="#ff9228" />
        </View>
        <View style={styles.eduContent}>
          {item.major && <Text style={styles.eduMajor}>{item.major}</Text>}
          {item.school && (
            <View style={styles.schoolContainer}>
              <MaterialIcons name="business" size={14} color="#666" />
              <Text style={styles.eduSchool}>{item.school}</Text>
            </View>
          )}
          {(start || end) && (
            <View style={styles.timeContainer}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.eduTime}>
                {start} - {end}{duration ? ` · ${duration}` : ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.eduActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Icon name="pencil" size={16} color="#ff9228" />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item)}>
              <Icon name="delete" size={16} color="#ff4757" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
        <View style={styles.emptyContainer}>
          <Icon name="school-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No education added yet.</Text>
          <Text style={styles.emptySubtext}>Add your educational background to showcase your qualifications</Text>
        </View>
      ) : (
        <View style={styles.eduList}>
          {educations.map((item, idx) => (
            <EducationItem key={item.educationId || item.id || idx} item={item} index={idx} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    elevation: 2,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  title: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#150b3d', 
    flex: 1 
  },
  addBtn: {
    backgroundColor: '#fff6f2',
    borderRadius: 20,
    padding: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff9228',
  },
  separator: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginBottom: 16 
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: { 
    color: '#666', 
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  eduList: {
    gap: 12,
  },
  eduItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  eduIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eduContent: {
    flex: 1,
  },
  eduMajor: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 4 
  },
  schoolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eduSchool: { 
    fontSize: 14, 
    color: '#514a6b', 
    marginLeft: 4,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eduTime: { 
    fontSize: 13, 
    color: '#666', 
    marginLeft: 4,
  },
  eduActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  deleteBtn: {
    borderColor: '#ffebee',
    backgroundColor: '#fff5f5',
  },
}); 