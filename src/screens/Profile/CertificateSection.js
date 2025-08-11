import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { stripHtmlTags } from '../../utils/formatDate';

export default function CertificateSection({ certificates = [], onAdd, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Helper to format date MM/YYYY - đồng nhất với các section khác
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const handleOpenUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const handleDeleteCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowDeleteModal(true);
  };

  const confirmDeleteCertificate = () => {
    if (selectedCertificate && onDelete) {
      onDelete(selectedCertificate);
    }
    setShowDeleteModal(false);
    setSelectedCertificate(null);
  };

  const CertificateItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.certificateItem}
      onPress={() => onEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.certificateIconContainer}>
        <Icon name="certificate" size={20} color="#2563eb" />
      </View>
      <View style={styles.certificateContent}>
        {item.certificateName && (
          <Text style={styles.certificateTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.certificateName}
          </Text>
        )}
        {item.organization && (
          <View style={styles.orgContainer}>
            <MaterialIcons name="business" size={14} color="#666" />
            <Text style={styles.certificateOrg} numberOfLines={1} ellipsizeMode="tail">
              {item.organization}
            </Text>
          </View>
        )}
        {(item.month || item.year) && (
          <View style={styles.timeContainer}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.certificateTime} numberOfLines={1} ellipsizeMode="tail">
              {formatMonthYear(item.month || item.year)}
            </Text>
          </View>
        )}
        {item.certificateDescription && (
          <View style={styles.certificateSection}>
            <Text style={styles.certificateDesc} numberOfLines={3} ellipsizeMode="tail">
              {stripHtmlTags(item.certificateDescription)}
            </Text>
          </View>
        )}
        {item.certificateUrl && (
          <TouchableOpacity 
            style={styles.certificateUrl}
            onPress={(e) => {
              e.stopPropagation();
              handleOpenUrl(item.certificateUrl);
            }}
          >
            <Icon name="link" size={14} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.certificateUrlText}>View Certificate</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.certificateActions}>
        {onDelete && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]} 
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteCertificate(item);
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
        <Icon name="certificate-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Certificates</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.separator} />
      {(!certificates || certificates.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Icon name="certificate-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No certificates added yet.</Text>
          <Text style={styles.emptySubtext}>Add your certifications to demonstrate your qualifications</Text>
        </View>
      ) : (
        <View style={styles.certificateList}>
          {certificates.map((item, idx) => (
            <CertificateItem key={item.id || item.certificateId || idx} item={item} index={idx} />
          ))}
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setSelectedCertificate(null);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Certificate ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete this certificate "{selectedCertificate?.certificateName}"?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteCertificate}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowDeleteModal(false);
              setSelectedCertificate(null);
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
  certificateList: {
    gap: 12,
  },
  certificateItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  certificateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certificateContent: {
    flex: 1,
  },
  certificateTitle: { 
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  orgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  certificateOrg: { 
    fontSize: 14, 
    color: '#514a6b', 
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificateTime: { 
    fontSize: 13, 
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  fieldSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#514a6b',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  fieldContent: {
    fontSize: 13,
    color: '#514a6b',
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  certificateSection: { 
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  certificateDesc: { 
    fontSize: 13, 
    color: '#514a6b', 
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  certificateUrl: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2563eb',
    marginTop: 8,
  },
  certificateUrlText: { 
    fontSize: 13, 
    color: '#2563eb', 
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  certificateActions: { 
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
    fontSize: 18, 
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