import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

export default function AwardsSection({ awards = [], onAdd, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);

  // Helper to format date MM/YYYY
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const handleDeleteAward = (award) => {
    setSelectedAward(award);
    setShowDeleteModal(true);
  };

  const confirmDeleteAward = () => {
    if (selectedAward && onDelete) {
      onDelete(selectedAward);
    }
    setShowDeleteModal(false);
    setSelectedAward(null);
  };

  const AwardItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.awardItem}
      onPress={() => onEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.awardIconContainer}>
        <Icon name="trophy" size={20} color="#2563eb" />
      </View>
      <View style={styles.awardContent}>
        {item.awardName && (
          <Text style={styles.awardTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.awardName}
          </Text>
        )}
        {item.awardOrganization && (
          <Text style={styles.awardOrg} numberOfLines={1} ellipsizeMode="tail">
            {item.awardOrganization}
          </Text>
        )}
        {(item.month || item.year) && (
          <Text style={styles.awardTime} numberOfLines={1} ellipsizeMode="tail">
            {formatMonthYear(item.month || item.year)}
          </Text>
        )}
        {item.awardDescription && (
          <Text style={styles.awardDesc} numberOfLines={3} ellipsizeMode="tail">
            {item.awardDescription}
          </Text>
        )}
      </View>
      <View style={styles.awardActions}>
        {onDelete && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]} 
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteAward(item);
            }}
          >
            <Icon name="delete" size={16} color="#ff4757" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="trophy-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Awards</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.separator} />
      {(!awards || awards.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Icon name="trophy-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No awards added yet.</Text>
          <Text style={styles.emptySubtext}>Add your achievements and recognitions to stand out</Text>
        </View>
      ) : (
        <View style={styles.awardList}>
          {awards.map((item, idx) => (
            <AwardItem key={item.id || item.awardId || idx} item={item} index={idx} />
          ))}
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setSelectedAward(null);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Award ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete this award "{selectedAward?.awardName}"?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteAward}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowDeleteModal(false);
              setSelectedAward(null);
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
    fontSize: 16, 
    color: '#150b3d', 
    flex: 1,
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Medium',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  awardList: {
    gap: 12,
  },
  awardItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  awardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  awardContent: {
    flex: 1,
  },
  awardTitle: { 
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  awardOrg: { 
    fontSize: 14, 
    color: '#514a6b', 
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  awardTime: { 
    fontSize: 13, 
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  awardDesc: { 
    fontSize: 13, 
    color: '#514a6b', 
    fontStyle: 'italic', 
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  awardActions: { 
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
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  sheetDesc: { 
    color: '#514a6b', 
    fontSize: 14, 
    marginBottom: 24, 
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Bold',
  },
}); 