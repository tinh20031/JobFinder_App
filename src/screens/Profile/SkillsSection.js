import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const skillsData = await profileService.getSkillsList(token);
      setSkills(skillsData);
    } catch (error) {
      console.log('Load skills error:', error);
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

  const handleDeleteGroup = async (group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete all skills in group "${group.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('token');
              // Lọc ra các skillId trong group
              const skillIds = group.data.map(skill => skill.skillId).filter(Boolean);
              for (const id of skillIds) {
                await profileService.deleteSkill(id, token);
              }
              await loadSkills();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete group.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

  const renderSection = ({ section }) => (
    <TouchableOpacity
      style={styles.groupBox}
      activeOpacity={0.85}
      onPress={() => handleEditGroup(section)}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>
          {section.title} {section.type === 0 || section.type === 'Core' ? '(Core Skills)' : '(Soft Skills)'}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteGroup(section)} style={styles.groupActionBtn} onPressOut={e => e.stopPropagation && e.stopPropagation()}>
          <Icon name="delete" size={18} color="#757575" />
        </TouchableOpacity>
      </View>
      <View style={styles.skillChipWrap}>
        {section.data.map(renderSkillTag)}
      </View>
    </TouchableOpacity>
  );

  const groupedSections = groupSkillsByGroupNameAndType(skills);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="star-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Skills</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddSkill}>
          <Icon name="plus" size={18} color="#ff9228" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      {skills.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No skills added yet.</Text>
      ) : (
        <SectionList
          sections={groupedSections}
          keyExtractor={(item, index) => item.skillId ? item.skillId.toString() : index.toString()}
          renderSectionHeader={renderSection}
          renderItem={() => null}
          contentContainerStyle={styles.sectionListContent}
          stickySectionHeadersEnabled={false}
        />
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
    elevation: 2 
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
    padding: 4,
    marginLeft: 8,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  separator: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginBottom: 12 
  },
  emptyText: { 
    color: '#aaa', 
    fontStyle: 'italic', 
    textAlign: 'center', 
    marginVertical: 12 
  },
  sectionListContent: {
    paddingBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#130160',
    flex: 1,
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  groupActionBtn: {
    marginLeft: 8,
    padding: 4,
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  skillText: {
    color: '#130160',
    fontSize: 14,
    fontWeight: '500',
  },
  coreSkillTag: {
    backgroundColor: '#d6cdfe', // Light purple for Core skills
    borderColor: '#130160', // Dark purple for border
    borderWidth: 1,
  },
  softSkillTag: {
    backgroundColor: '#ffe0b2', // Light orange for Soft skills
    borderColor: '#ff9800', // Orange for border
    borderWidth: 1,
  },
  coreSkillText: {
    color: '#130160', // Dark purple for Core skills
  },
  softSkillText: {
    color: '#130160', // Dark orange for Soft skills
  },
  groupBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ececec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  skillChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  coreSkillChip: {
    backgroundColor: '#e3e9ff',
    borderColor: '#130160',
    borderWidth: 1,
  },
  softSkillChip: {
    backgroundColor: '#fff7e0',
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
    color: '#130160',
  },
}); 