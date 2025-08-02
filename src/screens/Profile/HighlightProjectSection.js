import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

export default function HighlightProjectSection({ projects = [], onAdd, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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

  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const handleDeleteProject = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    if (selectedProject && onDelete) {
      onDelete(selectedProject);
    }
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const formatDateRange = (startMonth, startYear, endMonth, endYear, isWorking) => {
    const start = formatMonthYear(startMonth);
    if (isWorking || !endMonth) {
      return `${start} - Now`;
    }
    const end = formatMonthYear(endMonth);
    return `${start} - ${end}`;
  };

  const ProjectItem = ({ item, index }) => (
    <View style={styles.projectItem}>
      <View style={styles.projectIconContainer}>
        <Icon name="lightbulb-on" size={20} color="#2563eb" />
      </View>
      <View style={styles.projectContent}>
        {item.projectName && <Text style={styles.projectTitle}>{item.projectName}</Text>}
        
        <View style={styles.projectMeta}>
          {item.isOngoing && (
            <View style={styles.workingBadge}>
              <Text style={styles.workingText}>Currently Working</Text>
            </View>
          )}
          {(item.monthStart || item.yearStart) && (
            <View style={styles.timeContainer}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.projectTime}>
                {formatDateRange(item.monthStart, item.yearStart, item.monthEnd, item.yearEnd, item.isOngoing)}
              </Text>
            </View>
          )}
        </View>
        
        {item.projectDescription && (
          <View style={styles.projectSection}>
            <Text style={styles.projectSectionTitle}>Description:</Text>
            <Text style={styles.projectDesc} numberOfLines={2} ellipsizeMode="tail">
              {item.projectDescription}
            </Text>
          </View>
        )}
        
        {item.technologies && (
          <View style={styles.projectSection}>
            <Text style={styles.projectSectionTitle}>Technologies Used:</Text>
            <Text style={styles.projectDesc} numberOfLines={1} ellipsizeMode="tail">
              {item.technologies}
            </Text>
          </View>
        )}
        
        {item.responsibilities && (
          <View style={styles.projectSection}>
            <Text style={styles.projectSectionTitle}>Key Responsibilities:</Text>
            <Text style={styles.projectDesc} numberOfLines={2} ellipsizeMode="tail">
              {item.responsibilities}
            </Text>
          </View>
        )}
        
        {item.teamSize && (
          <View style={styles.projectSection}>
            <Text style={styles.projectSectionTitle}>Team Size:</Text>
            <Text style={styles.projectDesc} numberOfLines={1} ellipsizeMode="tail">
              {item.teamSize}
            </Text>
          </View>
        )}
        
        {item.achievements && (
          <View style={styles.projectSection}>
            <Text style={styles.projectSectionTitle}>Achievements/Results:</Text>
            <Text style={styles.projectDesc} numberOfLines={2} ellipsizeMode="tail">
              {item.achievements}
            </Text>
          </View>
        )}
        
        {item.projectLink && (
          <View style={styles.projectSection}>
            <TouchableOpacity 
              style={styles.projectLink}
              onPress={() => handleOpenUrl(item.projectLink)}
            >
              <Icon name="link" size={14} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={styles.projectLinkText}>View project</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.projectActions}>
        {onEdit && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Icon name="pencil" size={16} color="#2563eb" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteProject(item)}>
            <Icon name="delete" size={16} color="#ff4757" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="lightbulb-on-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Highlight Projects</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.separator} />
      {(!projects || projects.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Icon name="lightbulb-on-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No highlight projects added yet.</Text>
          <Text style={styles.emptySubtext}>Add your best projects to showcase your skills and experience</Text>
        </View>
      ) : (
        <View style={styles.projectList}>
          {projects.map((item, idx) => (
            <ProjectItem key={item.id || item.highlightProjectId || idx} item={item} index={idx} />
          ))}
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setSelectedProject(null);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Project ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete this project "{selectedProject?.projectName}"?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteProject}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowDeleteModal(false);
              setSelectedProject(null);
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
  projectList: {
    gap: 12,
  },
  projectItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#150b3d', 
    marginBottom: 8 
  },
  projectMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    flexWrap: 'wrap',
    gap: 8,
  },
  workingBadge: { 
    backgroundColor: '#28a745', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 12 
  },
  workingText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectTime: { 
    fontSize: 13, 
    color: '#666',
    marginLeft: 4,
  },
  projectSection: { 
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  projectSectionTitle: { 
    fontWeight: '600', 
    fontSize: 13, 
    color: '#150b3d', 
    marginBottom: 4 
  },
  projectDesc: { 
    fontSize: 13, 
    color: '#514a6b', 
    lineHeight: 18 
  },
  projectLink: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  projectLinkText: { 
    fontSize: 13, 
    color: '#2563eb', 
    fontWeight: '500',
  },
  projectActions: { 
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