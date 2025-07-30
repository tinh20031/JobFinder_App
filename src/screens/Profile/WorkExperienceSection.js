import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function WorkExperienceSection({ works = [], onAdd, onEdit, onDelete }) {
  // Helper: format date MM/YYYY - tương tự web version
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const WorkExperienceItem = ({ item, index }) => {
    const start = formatMonthYear(item.monthStart);
    const end = item.isWorking ? 'Now' : formatMonthYear(item.monthEnd);

    return (
      <View style={styles.workItem}>
        <View style={styles.workIconContainer}>
          <Icon name="briefcase" size={20} color="#ff9228" />
        </View>
        <View style={styles.workContent}>
          {item.jobTitle && <Text style={styles.workTitle}>{item.jobTitle}</Text>}
          {item.companyName && (
            <View style={styles.companyContainer}>
              <MaterialIcons name="business" size={14} color="#666" />
              <Text style={styles.workCompany}>{item.companyName}</Text>
            </View>
          )}
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.workTime}>
              {start} - {end}
            </Text>
            {item.isWorking && (
              <View style={styles.statusTag}>
                <Text style={styles.statusText}>Currently Working</Text>
              </View>
            )}
          </View>
          
          {/* Display all fields like web version */}
          {item.workDescription && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Description:</Text>
              <Text style={styles.fieldContent}>{item.workDescription}</Text>
            </View>
          )}
          
          {item.responsibilities && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Responsibilities:</Text>
              <Text style={styles.fieldContent}>{item.responsibilities}</Text>
            </View>
          )}
          
          {item.achievements && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Achievements:</Text>
              <Text style={styles.fieldContent}>{item.achievements}</Text>
            </View>
          )}
          
          {item.technologies && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Technologies Used:</Text>
              <Text style={styles.fieldContent}>{item.technologies}</Text>
            </View>
          )}
          
          {item.projectName && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Project Name:</Text>
              <Text style={styles.fieldContent}>{item.projectName}</Text>
            </View>
          )}
        </View>
        <View style={styles.workActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Icon name="pencil" size={16} color="#ff9228" />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item.workExperienceId)}>
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
        <Icon name="briefcase-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Work Experience</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#ff9228" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.separator} />
      {(!works || works.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Icon name="briefcase-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No work experience added yet.</Text>
          <Text style={styles.emptySubtext}>Add your work history to showcase your professional background</Text>
        </View>
      ) : (
        <View style={styles.workList}>
          {works.map((item, idx) => (
            <WorkExperienceItem key={item.workExperienceId || idx} item={item} index={idx} />
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
  workList: {
    gap: 12,
  },
  workItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  workIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workContent: {
    flex: 1,
  },
  workTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 4 
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workCompany: { 
    fontSize: 14, 
    color: '#514a6b', 
    marginLeft: 4,
    fontWeight: '500',
  },
  timeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
    gap: 8,
  },
  workTime: { 
    fontSize: 13, 
    color: '#666',
    marginLeft: 4,
  },
  statusTag: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  fieldSection: { 
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fieldLabel: { 
    fontWeight: '600', 
    fontSize: 13, 
    color: '#150b3d', 
    marginBottom: 4 
  },
  fieldContent: { 
    fontSize: 13, 
    color: '#514a6b', 
    lineHeight: 18 
  },
  workActions: {
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