import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  PanResponder,
  Modal,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderDetail from '../../components/HeaderDetail';
import locationService from '../../services/locationService';
import { JobService } from '../../services/JobService';

const FilterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get saved filters from route params
  const savedFilters = route.params?.savedFilters || {};
  
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    location: savedFilters.location || '',
    salary: savedFilters.salary || '',
    workType: savedFilters.workType || '',
    jobLevel: savedFilters.jobLevel || '',
    employmentType: savedFilters.employmentType || '',
    experience: savedFilters.experience || '',
    education: savedFilters.education || '',
    jobFunction: savedFilters.jobFunction || '',
  });
  const [locationText, setLocationText] = useState(savedFilters.locationText || 'Select Location');
  const [industryText, setIndustryText] = useState(savedFilters.industryText || 'Select Industry');
  const [selectedJobTypes, setSelectedJobTypes] = useState(savedFilters.selectedJobTypes || []);
  const [datePosted, setDatePosted] = useState(savedFilters.datePosted || 'all');
  const [selectedLevels, setSelectedLevels] = useState(savedFilters.selectedLevels || []);
  const [salaryType, setSalaryType] = useState(savedFilters.salaryType || []); // Không có giá trị mặc định

  // Location picker states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Industry picker states
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [industrySearchText, setIndustrySearchText] = useState('');

  // Job Type states
  const [jobTypes, setJobTypes] = useState([]);
  const [loadingJobTypes, setLoadingJobTypes] = useState(false);

  // Level states
  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  // Salary states
  const [salaryRanges, setSalaryRanges] = useState([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(null);

  // Load provinces, industries, job types, levels and salary ranges on component mount
  useEffect(() => {
    loadProvinces();
    loadIndustries();
    loadJobTypes();
    loadLevels();
    loadSalaryRanges();
  }, [loadProvinces]);

  // Debug selectedJobTypes changes
  useEffect(() => {
    // If selectedJobTypes contains NaN values, reset it
    if (selectedJobTypes.some(id => isNaN(Number(id)))) {
      setSelectedJobTypes([]);
    }
  }, [selectedJobTypes]);

  // Debug selectedLevels changes
  useEffect(() => {
    // If selectedLevels contains NaN values, reset it
    if (selectedLevels.some(id => isNaN(Number(id)))) {
      setSelectedLevels([]);
    }
  }, [selectedLevels]);

  // Sync selectedFilters.salary with salaryType
  useEffect(() => {
    setSelectedFilters(prev => ({
      ...prev,
      salary: salaryType.length > 0 ? salaryType : '' // Nếu có selection thì gửi array, không thì empty string
    }));
  }, [salaryType]);

  const loadProvinces = useCallback(async () => {
    try {
      setLoadingProvinces(true);
      const provincesData = await locationService.getProvinces();
      setProvinces(provincesData);
      setFilteredProvinces(provincesData);
      
      // Restore selectedProvince from saved filters
      if (savedFilters.location && provincesData.length > 0) {
        const savedProvince = provincesData.find(province => province.name === savedFilters.location);
        if (savedProvince) {
          setSelectedProvince(savedProvince);
        }
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  }, [savedFilters.location]);

  const handleSearchLocation = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredProvinces(provinces);
    } else {
      const filtered = provinces.filter(province =>
        province.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProvinces(filtered);
    }
  };

  const loadIndustries = async () => {
    try {
      setLoadingIndustries(true);
      const industriesData = await JobService.getIndustries();
      setIndustries(industriesData);
      setFilteredIndustries(industriesData);
    } catch (error) {
      console.error('Error loading industries:', error);
    } finally {
      setLoadingIndustries(false);
    }
  };

  const handleSearchIndustry = (text) => {
    setIndustrySearchText(text);
    if (text.trim() === '') {
      setFilteredIndustries(industries);
    } else {
      const filtered = industries.filter(industry =>
        industry.industryName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredIndustries(filtered);
    }
  };

  const loadJobTypes = async () => {
    try {
      setLoadingJobTypes(true);
      const jobTypesData = await JobService.getJobTypes();
      setJobTypes(jobTypesData);
    } catch (error) {
      console.error('Error loading job types:', error);
    } finally {
      setLoadingJobTypes(false);
    }
  };

  const loadLevels = async () => {
    try {
      setLoadingLevels(true);
      const levelsData = await JobService.getLevels();
      setLevels(levelsData);
    } catch (error) {
      console.error('Error loading levels:', error);
    } finally {
      setLoadingLevels(false);
    }
  };

  const loadSalaryRanges = async () => {
    try {
      const salaryRangesData = await JobService.getSalaryRanges();
      setSalaryRanges(salaryRangesData);
    } catch (error) {
      console.error('Error loading salary ranges:', error);
      // This should not happen now since JobService always returns data
      // But if it does, provide the same fallback data
      setSalaryRanges([
        { id: 1, minSalary: 0, maxSalary: 1000, rangeName: '0 - 1000' },
        { id: 2, minSalary: 1000, maxSalary: 2000, rangeName: '1000 - 2000' },
        { id: 3, minSalary: 2000, maxSalary: 3000, rangeName: '2000 - 3000' },
        { id: 4, minSalary: 3000, maxSalary: 5000, rangeName: '3000 - 5000' },
        { id: 5, minSalary: 5000, maxSalary: 7000, rangeName: '5000 - 7000' },
        { id: 6, minSalary: 7000, maxSalary: 10000, rangeName: '7000 - 10000' },
        { id: 7, minSalary: 10000, maxSalary: 15000, rangeName: '10000 - 15000' },
        { id: 8, minSalary: 15000, maxSalary: 20000, rangeName: '15000 - 20000' }
      ]);
    }
  };

  const handleLocationSelect = (province) => {
    setSelectedProvince(province);
    setLocationText(province.name);
    setSelectedFilters(prev => ({
      ...prev,
      location: province.name, // Lưu tên tỉnh thay vì code
    }));
    setShowLocationModal(false);
  };

  const openLocationPicker = () => {
    setSearchText('');
    setFilteredProvinces(provinces);
    setShowLocationModal(true);
  };

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
    setIndustryText(industry.industryName);
    setSelectedFilters(prev => ({
      ...prev,
      jobFunction: industry.industryName, // Map to jobFunction instead of workType
    }));
    setShowIndustryModal(false);
  };

  const openIndustryPicker = () => {
    setIndustrySearchText('');
    setFilteredIndustries(industries);
    setShowIndustryModal(true);
  };

  const handleJobTypeToggle = (jobTypeId) => {
    // If jobTypeId is undefined or invalid, don't proceed
    if (jobTypeId === undefined || jobTypeId === null) {
      return;
    }
    
    setSelectedJobTypes(prev => {
      // Convert jobTypeId to number for consistent comparison
      const numericId = Number(jobTypeId);
      
      // Check if the result is NaN, if so reset the array
      if (isNaN(numericId)) {
        return [];
      }
      
      // Check if the ID is already in the array
      const isCurrentlySelected = prev.some(id => Number(id) === numericId);
      
      let newSelected;
      if (isCurrentlySelected) {
        // Remove if already selected
        newSelected = prev.filter(id => Number(id) !== numericId);
      } else {
        // Add if not selected
        newSelected = [...prev, numericId];
      }
      
      return newSelected;
    });
  };

  const handleLevelToggle = (levelId) => {
    // If levelId is undefined or invalid, don't proceed
    if (levelId === undefined || levelId === null) {
      return;
    }
    
    setSelectedLevels(prev => {
      // Convert levelId to number for consistent comparison
      const numericId = Number(levelId);
      
      // Check if the result is NaN, if so reset the array
      if (isNaN(numericId)) {
        return [];
      }
      
      // Check if the ID is already in the array
      const isCurrentlySelected = prev.some(id => Number(id) === numericId);
      
      let newSelected;
      if (isCurrentlySelected) {
        // Remove if already selected
        newSelected = prev.filter(id => Number(id) !== numericId);
      } else {
        // Add if not selected
        newSelected = [...prev, numericId];
      }
      
      return newSelected;
    });
  };

  const handleApply = () => {
    // Map selected values to filter structure
    const finalFilters = {
      ...selectedFilters,
      // Ensure salary is properly set as array
      salary: salaryType.length > 0 ? salaryType : '',
      // Map job types - try to find the jobType by ID
      workType: selectedJobTypes.length > 0 ? (() => {
        const selectedJobType = jobTypes.find(jt => {
          const jtId = jt.id || jt.jobTypeId || jt.industryId;
          return Number(jtId) === selectedJobTypes[0];
        });
        return selectedJobType?.jobTypeName || '';
      })() : '',
      // Map levels - try to find the level by ID
      jobLevel: selectedLevels.length > 0 ? (() => {
        const selectedLevel = levels.find(l => {
          const lId = l.id || l.levelId;
          return Number(lId) === selectedLevels[0];
        });
        return selectedLevel?.levelName || '';
      })() : '',
      // Map date posted
      employmentType: datePosted !== 'all' ? datePosted : '',
    };
    
    // Save current filter state for next time
    const savedFilterState = {
      ...selectedFilters,
      locationText,
      industryText,
      selectedJobTypes,
      datePosted,
      selectedLevels,
      salaryType,
      selectedProvince,
      selectedIndustry,
    };
    
    // Pass selected filters back to JobListScreen
    navigation.navigate('JobList', { 
      filters: finalFilters,
      savedFilters: savedFilterState 
    });
  };

  const filterCategories = [
    {
      id: 'location',
      title: 'Location ',
      type: 'location-salary',
    },
    {
      id: 'workType',
      title: 'Industry',
      type: 'industry',
    },
    {
      id: 'jobLevel',
      title: 'Job Type',
      type: 'job-type',
    },
    {
      id: 'employmentType',
      title: 'Date Posted',
      type: 'date-posted',
    },
    {
      id: 'experience',
      title: 'Level',
      type: 'level',
    },
    {
      id: 'education',
      title: 'Salary',
      type: 'salary',
    },
  ];

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleFilterSelect = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  const handleReset = () => {
    setSelectedFilters({
      location: '',
      salary: '',
      workType: '',
      jobLevel: '',
      employmentType: '',
      experience: '',
      education: '',
      jobFunction: '',
    });
    setLocationText('Select Location');
    setIndustryText('Select Industry');
    setSelectedJobTypes([]);
    setDatePosted('all');
    setSelectedLevels([]);
    setSalaryType([]); // Reset về empty array
    setSelectedSalaryRange(null);
  };


  const renderLocationSalaryContent = () => (
    <View style={styles.locationSalaryContent}>
      {/* Location Input */}
      <TouchableOpacity style={styles.periodContainer} onPress={openLocationPicker}>
        <MaterialIcons name="location-on" size={20} color="#666" style={styles.inputIcon} />
        <Text style={styles.periodText}>{locationText}</Text>
        <View style={styles.spacer} />
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderIndustryContent = () => (
    <View style={styles.locationSalaryContent}>
      {/* Industry Input */}
      <TouchableOpacity style={styles.periodContainer} onPress={openIndustryPicker}>
        <MaterialIcons name="business" size={20} color="#666" style={styles.inputIcon} />
        <Text style={styles.periodText}>{industryText}</Text>
        <View style={styles.spacer} />
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderJobTypeContent = () => {
    if (loadingJobTypes) {
    return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading job types...</Text>
          </View>
      );
    }



    return (
      <View style={styles.locationSalaryContent}>
        {jobTypes.map((jobType, index) => {
          // Try different possible ID fields
          const jobTypeId = jobType.id || jobType.jobTypeId || jobType.industryId || index;
          const numericId = Number(jobTypeId);
          const isSelected = selectedJobTypes.some(id => Number(id) === numericId);
          
          return (
        <TouchableOpacity 
              key={jobTypeId}
          style={styles.radioOption} 
              onPress={() => handleJobTypeToggle(jobTypeId)}
        >
          <View style={[
            styles.checkboxButton,
                isSelected && styles.checkboxButtonSelected
          ]}>
                {isSelected && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
            <Text style={styles.radioOptionText}>{jobType.jobTypeName}</Text>
        </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDatePostedContent = () => (
    <View style={styles.locationSalaryContent}>
      {[
        { key: 'all', label: 'All', value: 'all' },
        { key: 'last-hour', label: 'Last Hour', value: 'last-hour' },
        { key: 'last-24-hour', label: 'Last 24 Hour', value: 'last-24-hour' },
        { key: 'last-7-days', label: 'Last 7 Days', value: 'last-7-days' },
        { key: 'last-14-days', label: 'Last 14 Days', value: 'last-14-days' },
        { key: 'last-30-days', label: 'Last 30 Days', value: 'last-30-days' }
      ].map((option) => (
      <TouchableOpacity 
          key={option.key}
        style={styles.radioOption} 
          onPress={() => setDatePosted(option.value)}
      >
        <View style={styles.radioButton}>
            {datePosted === option.value && <View style={styles.radioButtonSelected} />}
        </View>
          <Text style={styles.radioOptionText}>{option.label}</Text>
      </TouchableOpacity>
      ))}
    </View>
  );

  const renderLevelContent = () => {
    if (loadingLevels) {
    return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading levels...</Text>
          </View>
      );
    }



    return (
      <View style={styles.locationSalaryContent}>
        {levels.map((level, index) => {
          // Try different possible ID fields
          const levelId = level.id || level.levelId || level.industryId || index;
          const numericId = Number(levelId);
          const isSelected = selectedLevels.some(id => Number(id) === numericId);
          
          return (
        <TouchableOpacity 
              key={levelId}
          style={styles.radioOption} 
              onPress={() => handleLevelToggle(levelId)}
        >
          <View style={[
            styles.checkboxButton,
                isSelected && styles.checkboxButtonSelected
          ]}>
                {isSelected && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
            <Text style={styles.radioOptionText}>{level.levelName}</Text>
        </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSalaryContent = () => {
    const handleSalaryTypeChange = (type) => {
      setSalaryType(prev => {
        if (prev.includes(type)) {
          // Remove if already selected
          return prev.filter(t => t !== type);
      } else {
          // Add if not selected
          return [...prev, type];
      }
      });
    };

    const handleSalaryRangeSelect = (range) => {
      // Handle special cases for salary ranges
      let rangeKey;
      if (range.minSalary === null && range.maxSalary === null) {
        // Negotiable salary
        rangeKey = 'negotiable';
      } else if (range.maxSalary === null) {
        // Open-ended range (e.g., 100000+)
        rangeKey = `${range.minSalary}+`;
      } else {
        // Normal range
        rangeKey = `${range.minSalary}-${range.maxSalary}`;
      }
      
      setSalaryType(prev => {
        if (prev.includes(rangeKey)) {
          // Remove if already selected
          return prev.filter(t => t !== rangeKey);
        } else {
          // Add if not selected
          return [...prev, rangeKey];
        }
      });
      
      // Update min/max salary in selectedFilters
      setSelectedFilters(prev => ({
        ...prev,
        minSalary: range.minSalary,
        maxSalary: range.maxSalary,
      }));
    };



    return (
    <View style={styles.locationSalaryContent}>
      {/* Negotiable Salary Option */}
      <TouchableOpacity 
        style={styles.radioOption} 
          onPress={() => handleSalaryTypeChange('negotiable')}
      >
        <View style={[
          styles.checkboxButton,
          salaryType.includes('negotiable') && styles.checkboxButtonSelected
        ]}>
          {salaryType.includes('negotiable') && <MaterialIcons name="check" size={16} color="#fff" />}
        </View>
        <Text style={styles.radioOptionText}>Negotiable Salary</Text>
      </TouchableOpacity>

      {/* Salary Range Options - all at same level */}
      {salaryRanges.map((range) => {
        const rangeKey = `${range.minSalary}-${range.maxSalary}`;
        const isSelected = salaryType.includes(rangeKey);
        
        return (
              <TouchableOpacity 
                key={range.id}
            style={styles.radioOption}
                onPress={() => handleSalaryRangeSelect(range)}
              >
            <View style={[
              styles.checkboxButton,
              isSelected && styles.checkboxButtonSelected
            ]}>
              {isSelected && <MaterialIcons name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.radioOptionText}>
                  {range.rangeName || range.name || `${range.minSalary || 0} - ${range.maxSalary || '∞'}`}
            </Text>
              </TouchableOpacity>
        );
      })}
    </View>
  );
  };

  const renderFilterCategory = (category) => {
    const isExpanded = expandedCategories.includes(category.id);

    return (
      <View key={category.id} style={styles.filterCategory}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => handleCategoryToggle(category.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <MaterialIcons
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.categoryContent}>
            {category.type === 'location-salary' ? (
              renderLocationSalaryContent()
            ) : category.type === 'industry' ? (
              renderIndustryContent()
            ) : category.type === 'job-type' ? (
              renderJobTypeContent()
            ) : category.type === 'date-posted' ? (
              renderDatePostedContent()
            ) : category.type === 'level' ? (
              renderLevelContent()
            ) : category.type === 'salary' ? (
              renderSalaryContent()
            ) : (
              <View style={styles.optionsContainer}>
                {category.options?.map((option, index) => (
                  <TouchableOpacity
                    key={`${category.id}-${option}-${index}`}
                    style={[
                      styles.filterOption,
                      selectedFilters[category.id] === option && styles.selectedOption,
                    ]}
                    onPress={() => handleFilterSelect(category.id, option)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilters[category.id] === option && styles.selectedOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <HeaderDetail/>
      
      {/* Header Title */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Filter Options</Text>
      </View>

      {/* Filter Categories */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {filterCategories.map((category) => renderFilterCategory(category))}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

             {/* Location Picker Modal */}
       <Modal
         visible={showLocationModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowLocationModal(false)}
       >
         <View style={styles.modalOverlay}>
           <TouchableOpacity 
             style={styles.modalBackdrop}
             activeOpacity={1}
             onPress={() => setShowLocationModal(false)}
           />
           <View style={styles.modalContent}>
             {/* Drag Handle */}
             <View style={styles.dragHandle} />
             
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Select Location</Text>
               <TouchableOpacity
                 onPress={() => setShowLocationModal(false)}
                 style={styles.closeIcon}
               >
                 <MaterialIcons name="close" size={24} color="#666" />
               </TouchableOpacity>
             </View>
             
             {/* Search Bar */}
             <View style={styles.searchContainer}>
               <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
               <TextInput
                 style={styles.searchInput}
                 placeholder="Search provinces..."
                 value={searchText}
                 onChangeText={handleSearchLocation}
                 placeholderTextColor="#999"
               />
             </View>

             {loadingProvinces ? (
               <View style={styles.loadingContainer}>
                 <Text style={styles.loadingText}>Loading provinces...</Text>
               </View>
             ) : filteredProvinces.length > 0 ? (
               <FlatList
                 data={filteredProvinces}
                 renderItem={({ item }) => (
                   <TouchableOpacity
                     style={[
                       styles.provinceItem,
                       selectedProvince?.province_code === item.province_code && styles.selectedProvinceItem
                     ]}
                     onPress={() => handleLocationSelect(item)}
                   >
                     <Text style={[
                       styles.provinceName,
                       selectedProvince?.province_code === item.province_code && styles.selectedProvinceName
                     ]}>
                       {item.name}
                     </Text>
                     {selectedProvince?.province_code === item.province_code && (
                       <MaterialIcons name="check" size={20} color="#2563eb" />
                     )}
                   </TouchableOpacity>
                 )}
                 keyExtractor={(item) => item.province_code}
                 showsVerticalScrollIndicator={false}
                 style={styles.provinceList}
               />
             ) : (
               <View style={styles.noResultsContainer}>
                 <MaterialIcons name="search-off" size={48} color="#ccc" />
                 <Text style={styles.noResultsText}>No provinces found</Text>
                 <Text style={styles.noResultsSubtext}>Try a different search term</Text>
               </View>
             )}
                      </View>
         </View>
       </Modal>

       {/* Industry Picker Modal */}
       <Modal
         visible={showIndustryModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowIndustryModal(false)}
       >
         <View style={styles.modalOverlay}>
           <TouchableOpacity 
             style={styles.modalBackdrop}
             activeOpacity={1}
             onPress={() => setShowIndustryModal(false)}
           />
           <View style={styles.modalContent}>
             {/* Drag Handle */}
             <View style={styles.dragHandle} />
             
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Select Industry</Text>
               <TouchableOpacity
                 onPress={() => setShowIndustryModal(false)}
                 style={styles.closeIcon}
               >
                 <MaterialIcons name="close" size={24} color="#666" />
               </TouchableOpacity>
             </View>
             
             {/* Search Bar */}
             <View style={styles.searchContainer}>
               <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
               <TextInput
                 style={styles.searchInput}
                 placeholder="Search industries..."
                 value={industrySearchText}
                 onChangeText={handleSearchIndustry}
                 placeholderTextColor="#999"
               />
             </View>

             {loadingIndustries ? (
               <View style={styles.loadingContainer}>
                 <Text style={styles.loadingText}>Loading industries...</Text>
               </View>
             ) : filteredIndustries.length > 0 ? (
               <FlatList
                 data={filteredIndustries}
                 renderItem={({ item }) => (
                   <TouchableOpacity
                     style={[
                       styles.provinceItem,
                       selectedIndustry?.industryId === item.industryId && styles.selectedProvinceItem
                     ]}
                     onPress={() => handleIndustrySelect(item)}
                   >
                     <Text style={[
                       styles.provinceName,
                       selectedIndustry?.industryId === item.industryId && styles.selectedProvinceName
                     ]}>
                       {item.industryName}
                     </Text>
                     {selectedIndustry?.industryId === item.industryId && (
                       <MaterialIcons name="check" size={20} color="#2563eb" />
                     )}
                   </TouchableOpacity>
                 )}
                 keyExtractor={(item) => item.industryId.toString()}
                 showsVerticalScrollIndicator={false}
                 style={styles.provinceList}
               />
             ) : (
               <View style={styles.noResultsContainer}>
                 <MaterialIcons name="search-off" size={48} color="#ccc" />
                 <Text style={styles.noResultsText}>No industries found</Text>
                 <Text style={styles.noResultsSubtext}>Try a different search term</Text>
               </View>
             )}
           </View>
         </View>
       </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header Title Styles
  headerTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    color: '#333',
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontFamily: 'Poppins-Bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterCategory: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  categoryContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Location & Salary specific styles
  locationSalaryContent: {
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  inputIcon: {
    marginRight: 8,
  },
  spacer: {
    flex: 1,
  },
  // Checkbox styles
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 2,
  },
  checkboxButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxButtonSelected: {
    backgroundColor: '#2563eb',
  },
  // Radio button styles for Date Posted
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioOptionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },

  // Range display box styles
  rangeDisplayBox: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  rangeDisplayText: {
    fontSize: 16,
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  // Salary range options styles
  salaryRangeOptions: {
    marginTop: 16,
  },
  salaryRangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedSalaryRangeOption: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2563eb',
  },
  salaryRangeText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  selectedSalaryRangeText: {
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
  },

  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  periodText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  // Regular filter options styles
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  selectedOptionText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: '70%',
    padding: 0,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  closeIcon: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  provinceList: {
    flex: 1,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  selectedProvinceItem: {
    backgroundColor: '#f0f8ff',
  },
  provinceName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  selectedProvinceName: {
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default FilterScreen; 