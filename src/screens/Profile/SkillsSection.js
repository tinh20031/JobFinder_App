import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function groupSkillsByGroupNameAndType(skills) {
  // Group by groupName + type
  const groups = {};
  for (const skill of skills) {
    const groupKey = `${skill.groupName || 'Other'}|${skill.type}`;
    if (!groups[groupKey]) {
      groups[groupKey] = {
        title: skill.groupName || 'Other',
        type: skill.type,
        data: [],
      };
    }
    groups[groupKey].data.push(skill);
  }
  return Object.values(groups);
}

export default function SkillsSection({ navigation }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const skillsData = await profileService.getSkillsList(token);
      setSkills(skillsData);
          } catch (error) {
        // Handle error silently
      } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    navigation.navigate('AddSkillScreen');
  };

  const handleEditGroup = (group) => {
    navigation.navigate('EditSkillScreen', { group });
  };

  const handleDeleteGroup = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      // Lọc ra các skillId trong group
      const skillIds = selectedGroup.data.map(skill => skill.skillId).filter(Boolean);
      for (const id of skillIds) {
        await profileService.deleteSkill(id, token);
      }
      await loadSkills();
          } catch (error) {
        // Handle error silently
      } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedGroup(null);
    }
  };

  const renderSkillTag = (skill, index) => (
    <View key={skill.skillId || index} style={[
      styles.skillTag,
      skill.type === 0 || skill.type === 'Core' ? styles.coreSkillTag : styles.softSkillTag
    ]}>
      <Text style={[
        styles.skillText,
        skill.type === 0 || skill.type === 'Core' ? styles.coreSkillText : styles.softSkillText
      ]}>
        {skill.skillName}
        {skill.experience ? ` (${skill.experience})` : ''}
      </Text>
    </View>
  );

  const renderSkillGroup = ({ item: group }) => (
    <TouchableOpacity
      style={styles.groupBox}
      activeOpacity={0.85}
      onPress={() => handleEditGroup(group)}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleContainer}>
          <Icon 
            name={group.type === 0 || group.type === 'Core' ? 'star' : 'heart'} 
            size={16} 
            color={group.type === 0 || group.type === 'Core' ? '#2563eb' : '#ff6b35'} 
            style={{ marginRight: 8 }}
          />
          <Text style={styles.groupTitle}>
            {group.title} {group.type === 0 || group.type === 'Core' ? '(Core Skills)' : '(Soft Skills)'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteGroup(group)} style={styles.groupActionBtn} onPressOut={e => e.stopPropagation && e.stopPropagation()}>
          <Icon name="delete" size={16} color="#ff4757" />
        </TouchableOpacity>
      </View>
      <View style={styles.skillChipWrap}>
        {group.data.map(renderSkillTag)}
      </View>
    </TouchableOpacity>
  );

  const groupedSections = groupSkillsByGroupNameAndType(skills);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading skills...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="star-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Skills</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddSkill}>
          <Icon name="plus" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      {skills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="star-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No skills added yet.</Text>
          <Text style={styles.emptySubtext}>Add your skills to showcase your expertise to employers</Text>
        </View>
      ) : (
        <FlatList
          data={groupedSections}
          renderItem={renderSkillGroup}
          keyExtractor={(item, index) => `${item.title}-${item.type}-${index}`}
          contentContainerStyle={styles.sectionListContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setSelectedGroup(null);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Group ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete all skills in group "{selectedGroup?.title}"?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteGroup}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowDeleteModal(false);
              setSelectedGroup(null);
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
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
  sectionListContent: {
    paddingBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#130160',
  },
  groupActionBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 14,
    color: '#150b3d',
    fontWeight: '500',
  },
  coreSkillTag: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  softSkillTag: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  coreSkillText: {
    color: '#2563eb',
  },
  softSkillText: {
    color: '#ff6b35',
  },
  groupBox: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  skillChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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