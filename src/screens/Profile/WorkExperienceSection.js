import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

export default function WorkExperienceSection({ works = [], onAdd, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  // Helper: format date MM/YYYY - tương tự web version
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const handleDeleteWork = (work) => {
    setSelectedWork(work);
    setShowDeleteModal(true);
  };

  const confirmDeleteWork = () => {
    if (selectedWork && onDelete) {
      onDelete(selectedWork.id);
    }
    setShowDeleteModal(false);
    setSelectedWork(null);
  };

  const WorkExperienceItem = ({ item, index }) => {
    const start = formatMonthYear(item.monthStart);
    const end = item.isWorking ? 'Now' : formatMonthYear(item.monthEnd);

    return (
      <View style={styles.workItem}>
        <View style={styles.workIconContainer}>
          <Icon name="briefcase" size={20} color="#2563eb" />
        </View>
        <View style={styles.workContent}>
          {item.jobTitle && (
            <Text style={styles.workTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.jobTitle}
            </Text>
          )}
          {item.companyName && (
            <View style={styles.companyContainer}>
              <MaterialIcons name="business" size={14} color="#666" />
              <Text style={styles.workCompany} numberOfLines={1} ellipsizeMode="tail">
                {item.companyName}
              </Text>
            </View>
          )}
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.workTime} numberOfLines={1} ellipsizeMode="tail">
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
              <Text style={styles.fieldContent} numberOfLines={2} ellipsizeMode="tail">
                {item.workDescription}
              </Text>
            </View>
          )}
          
          {item.responsibilities && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Responsibilities:</Text>
              <Text style={styles.fieldContent} numberOfLines={2} ellipsizeMode="tail">
                {item.responsibilities}
              </Text>
            </View>
          )}
          
          {item.achievements && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Achievements:</Text>
              <Text style={styles.fieldContent} numberOfLines={2} ellipsizeMode="tail">
                {item.achievements}
              </Text>
            </View>
          )}
          
          {item.technologies && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Technologies Used:</Text>
              <Text style={styles.fieldContent} numberOfLines={1} ellipsizeMode="tail">
                {item.technologies}
              </Text>
            </View>
          )}
          
          {item.projectName && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Project Name:</Text>
              <Text style={styles.fieldContent} numberOfLines={1} ellipsizeMode="tail">
                {item.projectName}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.workActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Icon name="pencil" size={16} color="#2563eb" />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteWork(item)}>
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
        <Icon name="briefcase-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Work Experience</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#2563eb" />
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
            <WorkExperienceItem key={item.id || item.workExperienceId || idx} item={item} index={idx} />
          ))}
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setSelectedWork(null);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Work Experience ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete this work experience "{selectedWork?.jobTitle}"?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteWork}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowDeleteModal(false);
              setSelectedWork(null);
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
    backgroundColor: '#f0f7ff',
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
}); 