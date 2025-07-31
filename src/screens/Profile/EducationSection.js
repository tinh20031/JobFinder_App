import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

export default function EducationSection({ educations, onAdd, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);

  // Helper: format date MM/YYYY - đồng nhất với các section khác
  function formatMonthYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  }
  function calcDuration(start, end) {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffTime = Math.abs(endDate - startDate);
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears === 1 ? "1 year" : `${diffYears} years`;
  }

  const handleDeleteEducation = (education) => {
    setSelectedEducation(education);
    setShowDeleteModal(true);
  };

  const confirmDeleteEducation = () => {
    if (selectedEducation && onDelete) {
      onDelete(selectedEducation);
    }
    setShowDeleteModal(false);
    setSelectedEducation(null);
  };

  const EducationItem = ({ item, index }) => {
    const start = formatMonthYear(item.monthStart);
    const end = item.isStudying ? 'Now' : formatMonthYear(item.monthEnd);
    const duration = calcDuration(item.monthStart, item.monthEnd);

    return (
      <View style={styles.eduItem}>
        <View style={styles.eduIconContainer}>
          <Icon name="school" size={20} color="#2563eb" />
        </View>
        <View style={styles.eduContent}>
          {item.level && (
            <Text style={styles.eduLevel} numberOfLines={1} ellipsizeMode="tail">
              {item.level}
            </Text>
          )}
          {item.school && (
            <View style={styles.schoolContainer}>
              <MaterialIcons name="business" size={14} color="#666" />
              <Text style={styles.eduSchool} numberOfLines={1} ellipsizeMode="tail">
                {item.school}
              </Text>
            </View>
          )}
          {item.major && (
            <Text style={styles.eduMajor} numberOfLines={1} ellipsizeMode="tail">
              {item.major}
            </Text>
          )}
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.eduTime} numberOfLines={1} ellipsizeMode="tail">
              {start} - {end} ({duration})
            </Text>
          </View>
          
          {item.gpa && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>GPA:</Text>
              <Text style={styles.fieldContent} numberOfLines={1} ellipsizeMode="tail">
                {item.gpa}
              </Text>
            </View>
          )}
          
          {item.description && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Description:</Text>
              <Text style={styles.fieldContent} numberOfLines={2} ellipsizeMode="tail">
                {item.description}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.eduActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Icon name="pencil" size={16} color="#2563eb" />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteEducation(item)}>
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
        <Icon name="school-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Education</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Icon name="plus" size={18} color="#2563eb" />
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

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setSelectedEducation(null);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Education ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete this education "{selectedEducation?.level}" at "{selectedEducation?.school}"?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteEducation}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowDeleteModal(false);
              setSelectedEducation(null);
            }}
          >
            <Text style={styles.sheetBtnUndoText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    padding: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
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
    backgroundColor: '#f0f7ff',
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
  // Modal styles
  modal: { 
    justifyContent: 'flex-end', 
    margin: 0 
  },
  sheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    alignItems: 'center' 
  },
  sheetHandle: { 
    width: 34, 
    height: 4, 
    backgroundColor: '#ccc', 
    borderRadius: 2, 
    marginBottom: 16 
  },
  sheetTitle: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#150b3d', 
    marginBottom: 12 
  },
  sheetDesc: { 
    color: '#514a6b', 
    fontSize: 14, 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 12,
  },
  sheetBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sheetBtnUndo: {
    width: '100%',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 0,
  },
  sheetBtnUndoText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fieldSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#514a6b',
    fontWeight: '500',
    marginRight: 8,
  },
  fieldContent: {
    fontSize: 13,
    color: '#150b3d',
    flex: 1,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
}); 