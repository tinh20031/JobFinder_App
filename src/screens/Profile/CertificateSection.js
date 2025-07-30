import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function CertificateSection({ certificates = [], onAdd, onEdit, onDelete }) {
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

  const CertificateItem = ({ item, index }) => (
    <View style={styles.certificateItem}>
      <View style={styles.certificateIconContainer}>
        <Icon name="certificate" size={20} color="#ff9228" />
      </View>
      <View style={styles.certificateContent}>
        {item.certificateName && <Text style={styles.certificateTitle}>{item.certificateName}</Text>}
        {item.organization && (
          <View style={styles.orgContainer}>
            <MaterialIcons name="business" size={14} color="#666" />
            <Text style={styles.certificateOrg}>{item.organization}</Text>
          </View>
        )}
        {(item.month || item.year) && (
          <View style={styles.timeContainer}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.certificateTime}>
              {item.month ? `${item.month.slice(5, 7)}/${item.month.slice(0, 4)}` : ''}
            </Text>
          </View>
        )}
        {item.certificateDescription && (
          <View style={styles.certificateSection}>
            <Text style={styles.certificateDesc}>{item.certificateDescription}</Text>
          </View>
        )}
        {item.certificateUrl && (
          <TouchableOpacity 
            style={styles.certificateUrl}
            onPress={() => handleOpenUrl(item.certificateUrl)}
          >
            <Icon name="link" size={14} color="#ff9228" style={{ marginRight: 6 }} />
            <Text style={styles.certificateUrlText}>View Certificate</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.certificateActions}>
        {onEdit && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Icon name="pencil" size={16} color="#ff9228" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item)}>
            <Icon name="delete" size={16} color="#ff4757" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="certificate-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Certificates</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#ff9228" />
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
            <CertificateItem key={item.certificateId || idx} item={item} index={idx} />
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
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certificateContent: {
    flex: 1,
  },
  certificateTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 4 
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
  },
  certificateSection: { 
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  certificateDesc: { 
    fontSize: 13, 
    color: '#514a6b', 
    fontStyle: 'italic', 
    lineHeight: 18,
  },
  certificateUrl: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ff9228',
  },
  certificateUrlText: { 
    fontSize: 13, 
    color: '#ff9228', 
    fontWeight: '500',
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
}); 