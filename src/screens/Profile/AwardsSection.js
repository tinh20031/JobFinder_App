import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function AwardsSection({ awards = [], onAdd, onEdit, onDelete }) {
  // Helper to format date MM/YYYY
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const AwardItem = ({ item, index }) => (
    <View style={styles.awardItem}>
      <View style={styles.awardIconContainer}>
        <Icon name="trophy" size={20} color="#ff9228" />
      </View>
      <View style={styles.awardContent}>
        {item.awardName && <Text style={styles.awardTitle}>{item.awardName}</Text>}
        {item.awardOrganization && (
          <View style={styles.orgContainer}>
            <MaterialIcons name="business" size={14} color="#666" />
            <Text style={styles.awardOrg}>{item.awardOrganization}</Text>
          </View>
        )}
        {(item.month || item.year) && (
          <View style={styles.timeContainer}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.awardTime}>
              {formatMonthYear(item.month || item.year)}
            </Text>
          </View>
        )}
        {item.awardDescription && (
          <View style={styles.awardSection}>
            <Text style={styles.awardDesc}>{item.awardDescription}</Text>
          </View>
        )}
      </View>
      <View style={styles.awardActions}>
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
        <Icon name="trophy-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Awards</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#ff9228" />
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
            <AwardItem key={item.awardId || idx} item={item} index={idx} />
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
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  awardContent: {
    flex: 1,
  },
  awardTitle: { 
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
  awardOrg: { 
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
  awardTime: { 
    fontSize: 13, 
    color: '#666',
    marginLeft: 4,
  },
  awardSection: { 
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  awardDesc: { 
    fontSize: 13, 
    color: '#514a6b', 
    fontStyle: 'italic', 
    lineHeight: 18,
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
}); 