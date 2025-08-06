import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../services/profileService';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SKILL_SUGGESTIONS = [
  'Leadership', 'Teamwork', 'Communication', 'Problem Solving', 'Critical Thinking',
  'Creativity', 'Adaptability', 'Time Management', 'Project Management', 'Analytical Skills',
  'Technical Skills', 'Programming', 'Design', 'Marketing', 'Sales',
  'Customer Service', 'Research', 'Writing', 'Presentation', 'Negotiation',
  'Graphic Design', 'UI/UX Design', 'Web Development', 'Mobile Development', 'Data Analysis',
  'Machine Learning', 'Artificial Intelligence', 'Cloud Computing', 'DevOps', 'Cybersecurity'
];

export default function EditSkillScreen({ navigation, route }) {
  const editGroup = route?.params?.group;

  // Always call hooks
  const [groupName, setGroupName] = useState(editGroup?.title || '');
  const [skillType, setSkillType] = useState(editGroup?.type === 0 ? 'Core' : 'Soft');
  const [searchText, setSearchText] = useState('');
  const [experience, setExperience] = useState('');
  const [skillsInGroup, setSkillsInGroup] = useState(
    editGroup?.data
      ? editGroup.data.map(s => ({
          skillName: s.skillName,
          experience: s.experience || '',
          groupName: editGroup.title,
          type: editGroup.type === 0 ? 'Core' : 'Soft',
          skillId: s.id || s.skillId
        }))
      : []
  );
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'delete' | 'save' | 'back' | null

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

  useEffect(() => {
    filterSuggestions();
  }, [searchText, skillsInGroup, filterSuggestions]);

  if (!editGroup) return null;

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

  const handleDeleteGroup = () => setModalType('delete');
  const handleSaveGroup = () => setModalType('save');


  const handleDeleteGroupConfirm = async () => {
    setModalType(null);
    setSaving(true);
    try {
      const oldSkillIds = (editGroup.data || []).map(s => s.id || s.skillId).filter(Boolean);
      for (const id of oldSkillIds) {
        await profileService.deleteSkill(id);
      }
      // Không Alert nữa, chỉ goBack
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting skills:', error);
    } finally {
      setSaving(false);
    }
  };

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
      // Xóa hết skill cũ trong group - support cả skillId (old) và id (new)
      const oldSkillIds = (editGroup.data || []).map(s => s.id || s.skillId).filter(Boolean);
      for (const id of oldSkillIds) {
        await profileService.deleteSkill(id);
      }
      // Thêm lại toàn bộ skill mới
      for (const skill of skillsInGroup) {
        const type = skill.type === 'Core' ? 0 : 1;
        const skillToSend = { ...skill, groupName, type };
        delete skillToSend.skillId;
        await profileService.createSkill(skillToSend);
      }
      // Không Alert nữa, chỉ goBack
      navigation.goBack();
    } catch (error) {
      // Có thể dùng modal custom báo lỗi nếu muốn
    } finally {
      setSaving(false);
    }
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
      <Text style={styles.header}>Edit Skill Group</Text>
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
          {/* Ẩn trường Skill Type ở màn hình Edit */}
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
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.deleteGroupBtn, { flex: 1, marginRight: 6 }]}
              onPress={handleDeleteGroup}
              disabled={saving}
            >
              <Text style={styles.deleteGroupBtnText}>Delete Group</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveBtn, (skillsInGroup.length === 0 || !groupName.trim()) && styles.saveBtnDisabled, { flex: 1, marginLeft: 6 }]}
              onPress={handleSaveGroup}
              disabled={saving || skillsInGroup.length === 0 || !groupName.trim()}
            >
              <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Modal xác nhận xóa group */}
      <Modal
        isVisible={modalType !== null}
        onBackdropPress={() => setModalType(null)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {modalType === 'back' ? 'Undo Changes ?' : modalType === 'delete' ? 'Delete Group ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to undo your changes?'
              : modalType === 'delete'
              ? 'Are you sure you want to delete this skill group?'
              : 'Are you sure you want to save your changes?'}
          </Text>
          {modalType === 'delete' ? (
            <>
              <TouchableOpacity style={styles.sheetBtn} onPress={handleDeleteGroupConfirm}>
                <Text style={styles.sheetBtnText}>DELETE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnUndoText}>CONTINUE EDITING</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.sheetBtn} onPress={handleModalMainAction}>
                <Text style={styles.sheetBtnText}>{modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnUndoText}>CONTINUE EDITING</Text>
              </TouchableOpacity>
            </>
          )}
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
  header: {
    fontSize: 20,
    color: '#150b3d',
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'center',
    fontFamily: 'Poppins-Bold',
  },
  scrollView: {
    flex: 1,
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
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Regular',
  },
  skillAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: '#2563eb',
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
    fontFamily: 'Poppins-Regular',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginLeft: 6,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.84,
    textTransform: 'uppercase',
    fontFamily: 'Poppins-Bold',
  },
  coreBadge: {
    backgroundColor: '#2563eb',
  },
  softBadge: {
    backgroundColor: '#ffd700',
  },
  coreSkillText: {
    color: '#2563eb',
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
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
    fontFamily: 'Poppins-Medium',
  },
  deleteGroupBtn: {
    flex: 1,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginRight: 6,
  },
  deleteGroupBtnText: {
    color: '#2563eb',
    fontSize: 16,
    letterSpacing: 0.84,
    textTransform: 'uppercase',
    fontFamily: 'Poppins-Bold',
  },
  form: {
    width: SCREEN_WIDTH - 36,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    alignSelf: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontSize: 18, color: '#150b3d', marginBottom: 12, fontFamily: 'Poppins-Bold' },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center', fontFamily: 'Poppins-Regular' },
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
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
}); 