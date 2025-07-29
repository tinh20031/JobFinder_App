import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../services/profileService';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock skill suggestions - có thể thay bằng API call
const SKILL_SUGGESTIONS = [
  'Leadership', 'Teamwork', 'Communication', 'Problem Solving', 'Critical Thinking',
  'Creativity', 'Adaptability', 'Time Management', 'Project Management', 'Analytical Skills',
  'Technical Skills', 'Programming', 'Design', 'Marketing', 'Sales',
  'Customer Service', 'Research', 'Writing', 'Presentation', 'Negotiation',
  'Graphic Design', 'UI/UX Design', 'Web Development', 'Mobile Development', 'Data Analysis',
  'Machine Learning', 'Artificial Intelligence', 'Cloud Computing', 'DevOps', 'Cybersecurity'
];

export default function AddSkillScreen({ navigation, route }) {
  const editGroup = route?.params?.group;
  const isEditMode = route?.params?.mode === 'edit' && !!editGroup;

  const [groupName, setGroupName] = useState(isEditMode ? editGroup.title : '');
  const [skillType, setSkillType] = useState(isEditMode ? (editGroup.type === 0 ? 'Core' : 'Soft') : 'Core');
  const [searchText, setSearchText] = useState('');
  const [experience, setExperience] = useState('');
  const [skillsInGroup, setSkillsInGroup] = useState(isEditMode ? editGroup.data.map(s => ({
    skillName: s.skillName,
    experience: s.experience || '',
    groupName: editGroup.title,
    type: editGroup.type === 0 ? 'Core' : 'Soft',
    skillId: s.skillId
  })) : []);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'save' | 'back' | null

  useEffect(() => {
    filterSuggestions();
  }, [searchText, skillsInGroup, filterSuggestions]);

  const filterSuggestions = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = SKILL_SUGGESTIONS.filter(skill => 
      skill.toLowerCase().includes(searchText.toLowerCase()) &&
      !skillsInGroup.some(selected => selected.skillName.toLowerCase() === skill.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [searchText, skillsInGroup]);

  const handleAddSkillToGroup = (skillName) => {
    if (!skillName.trim()) return;
    if (skillsInGroup.some(s => s.skillName.toLowerCase() === skillName.toLowerCase())) {
      Alert.alert('Validation Error', 'This skill has already been added to the group.');
      return;
    }
    if (skillType === 'Core' && !experience.trim()) {
      Alert.alert('Validation Error', 'Please enter experience for this core skill.');
      return;
    }
    setSkillsInGroup([
      ...skillsInGroup,
      { skillName, experience: skillType === 'Core' ? experience : '', groupName, type: skillType }
    ]);
    setSearchText('');
    setExperience('');
    setFilteredSuggestions([]);
  };

  const handleRemoveSkillFromGroup = (index) => {
    setSkillsInGroup(skillsInGroup.filter((_, i) => i !== index));
  };

  const handleSaveGroup = () => setModalType('save');
  const handleBack = () => setModalType('back');

  const handleModalMainAction = async () => {
    if (modalType === 'back') {
      setModalType(null);
      navigation.goBack();
    } else if (modalType === 'save') {
      setModalType(null);
      await handleSaveGroupMain();
    }
  };

  const handleSaveGroupMain = async () => {
    if (!groupName.trim()) {
      Alert.alert('Validation Error', 'Please enter group name.');
      return;
    }
    if (skillsInGroup.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one skill to the group.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (isEditMode) {
        // Xóa hết skill cũ trong group
        const oldSkillIds = (editGroup.data || []).map(s => s.skillId).filter(Boolean);
        for (const id of oldSkillIds) {
          await profileService.deleteSkill(id, token);
        }
      }
      // Thêm lại toàn bộ skill mới
      for (const skill of skillsInGroup) {
        const type = skill.type === 'Core' ? 0 : 1;
        const skillToSend = { ...skill, groupName, type };
        delete skillToSend.skillId;
        console.log('Skill gửi lên:', skillToSend);
        await profileService.createSkill(skillToSend, token);
      }
      // Không Alert nữa, chỉ goBack
      navigation.goBack();
    } catch (error) {
      // Có thể dùng modal custom báo lỗi nếu muốn
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete all skills in group "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              setSaving(true);
              const token = await AsyncStorage.getItem('token');
              const oldSkillIds = (editGroup.data || []).map(s => s.skillId).filter(Boolean);
              for (const id of oldSkillIds) {
                await profileService.deleteSkill(id, token);
              }
              Alert.alert('Success', 'Group deleted!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete group.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const renderSkillChip = (skill, index) => (
    <View key={index} style={[styles.skillChip, skill.type === 'Core' ? styles.coreSkillChip : styles.softSkillChip]}>
      <Text style={styles.skillChipText}>
        {skill.skillName}{skill.experience ? ` (${skill.experience})` : ''}
      </Text>
      <TouchableOpacity onPress={() => handleRemoveSkillFromGroup(index)}>
        <Icon name="close" size={16} color="#514a6b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>
      <Text style={styles.header}>Add Skill Group</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Group Name *</Text>
          <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
            placeholderTextColor="#514a6b"
          />
        </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Skill Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={skillType}
            onValueChange={setSkillType}
            style={styles.picker}
            dropdownIconColor="#514a6b"
          >
            <Picker.Item label="Core Skills" value="Core" />
            <Picker.Item label="Soft Skills" value="Soft" />
          </Picker>
        </View>
      </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Add Skill</Text>
            <View style={styles.skillAddRow}>
              <TextInput
                style={[styles.textInput, { flex: 2 }]}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search skills"
                placeholderTextColor="#514a6b"
              />
              {skillType === 'Core' && (
                <TextInput
                  style={[styles.textInput, { flex: 1, marginLeft: 8 }]}
                  value={experience}
                  onChangeText={setExperience}
                  placeholder="Experience"
                  placeholderTextColor="#514a6b"
                />
              )}
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddSkillToGroup(searchText)}>
                <Icon name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {filteredSuggestions.length > 0 && searchText.trim() && !filteredSuggestions.some(s => s.toLowerCase() === searchText.trim().toLowerCase()) && (
              <View style={styles.suggestionsContainer}>
                {filteredSuggestions.map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setSearchText(item);
                      setFilteredSuggestions([]);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {skillsInGroup.length > 0 && (
            <View style={styles.skillChipList}>
              <Text style={styles.sectionTitle}>Skills in Group</Text>
              <View style={styles.skillChipWrap}>
                {skillsInGroup.map(renderSkillChip)}
          </View>
        </View>
      )}
          <TouchableOpacity 
            style={[styles.saveBtn, (skillsInGroup.length === 0 || !groupName.trim()) && styles.saveBtnDisabled]} 
            onPress={handleSaveGroup}
            disabled={saving || skillsInGroup.length === 0 || !groupName.trim()}
          >
            <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE GROUP'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {isEditMode && (
        <TouchableOpacity
          style={styles.deleteGroupBtn}
          onPress={handleDeleteGroup}
          disabled={saving}
        >
          <Text style={styles.deleteGroupBtnText}>Delete Group</Text>
        </TouchableOpacity>
      )}
      <Modal
        isVisible={modalType !== null}
        onBackdropPress={() => setModalType(null)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {modalType === 'back' ? 'Undo Changes ?' : 'Save Group ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to undo your changes?'
              : 'Are you sure you want to save this skill group?'}
          </Text>
          <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
            <Text style={styles.sheetBtnText}>CONTINUE EDITING</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleModalMainAction}>
            <Text style={styles.sheetBtnUndoText}>{modalType === 'back' ? 'UNDO CHANGES' : 'SAVE GROUP'}</Text>
      </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#150b3d',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#150b3d',
  },
  skillTypeContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#150b3d',
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
  },
  picker: {
    color: '#514a6b',
    fontSize: 16,
  },
  selectedSkillsContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  selectedSkillsList: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderLeftWidth: 4,
  },
  coreSkillHeader: {
    borderLeftColor: '#130160',
  },
  softSkillHeader: {
    borderLeftColor: '#e65100',
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  skillTypeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  skillTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  skillDetails: {
    gap: 12,
  },
  inputGroup: {
    marginHorizontal: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#514a6b',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#150b3d',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skillAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: '#130160',
    borderRadius: 8,
    marginLeft: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#150b3d',
  },
  saveBtn: {
    backgroundColor: '#130160',
    borderRadius: 8,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
  coreBadge: {
    backgroundColor: '#130160',
  },
  softBadge: {
    backgroundColor: '#ffd700',
  },
  coreSkillText: {
    color: '#130160',
  },
  softSkillText: {
    color: '#e65100',
  },
  skillChipList: {
    marginHorizontal: 18,
    marginBottom: 20,
  },
  skillChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3e9ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  coreSkillChip: {
    backgroundColor: '#e3e9ff',
  },
  softSkillChip: {
    backgroundColor: '#fff7e0',
  },
  skillChipText: {
    color: '#130160',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  deleteGroupBtn: {
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  deleteGroupBtnText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 12 },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#130160',
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
    backgroundColor: '#d6cdfe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 0,
  },
  sheetBtnUndoText: {
    color: '#130160',
    fontWeight: 'bold',
    fontSize: 16,
  },
  form: {
    width: SCREEN_WIDTH - 36,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    alignSelf: 'center',
  },
}); 