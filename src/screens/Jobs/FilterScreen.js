import React, { useState, useRef } from 'react';
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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderDetail from '../../components/HeaderDetail';

const FilterScreen = () => {
  const navigation = useNavigation();
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    salary: '',
    workType: '',
    jobLevel: '',
    employmentType: '',
    experience: '',
    education: '',
    jobFunction: '',
  });
  const [locationText, setLocationText] = useState('United States');
  const [industryText, setIndustryText] = useState('Technology');
  const [jobTypes, setJobTypes] = useState(['onsite']);
  const [datePosted, setDatePosted] = useState('all');
  const [levels, setLevels] = useState(['intern']);
  const [salaryType, setSalaryType] = useState('negotiable');
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 20000 });
  const [sliderWidth, setSliderWidth] = useState(300);
  const sliderRef = useRef(null);


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
    setLocationText('United States');
    setIndustryText('Technology');
    setJobTypes(['onsite']);
    setDatePosted('all');
    setLevels(['intern']);
    setSalaryType('negotiable');
    setSalaryRange({ min: 0, max: 20000 });
  };

  const handleApply = () => {
    // Pass selected filters back to JobListScreen
    navigation.navigate('JobList', { filters: selectedFilters });
  };

  // State for active thumb
  const [activeThumb, setActiveThumb] = useState(null);

  // Improved PanResponder for dual-thumb slider
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const { locationX } = evt.nativeEvent;
      const minPosition = (salaryRange.min / 20000) * sliderWidth;
      const maxPosition = (salaryRange.max / 20000) * sliderWidth;
      
      // Determine which thumb is closer to the tap
      const distanceToMin = Math.abs(locationX - minPosition);
      const distanceToMax = Math.abs(locationX - maxPosition);
      
      // Set the active thumb based on which is closer
      if (distanceToMin < distanceToMax) {
        setActiveThumb('min');
        console.log('Activated MIN thumb');
      } else {
        setActiveThumb('max');
        console.log('Activated MAX thumb');
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const { locationX } = evt.nativeEvent;
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const newValue = Math.round(percentage * 20000);
      
      if (activeThumb === 'min') {
        const newMin = Math.max(0, Math.min(salaryRange.max - 1000, newValue));
        setSalaryRange(prev => ({ ...prev, min: newMin }));
      } else if (activeThumb === 'max') {
        const newMax = Math.max(salaryRange.min + 1000, Math.min(20000, newValue));
        setSalaryRange(prev => ({ ...prev, max: newMax }));
      }
    },
    onPanResponderRelease: () => {
      setActiveThumb(null);
    },
  });



  const renderLocationSalaryContent = () => (
    <View style={styles.locationSalaryContent}>
      {/* Location Input */}
      <TouchableOpacity style={styles.periodContainer} onPress={() => console.log('Open location picker')}>
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
      <TouchableOpacity style={styles.periodContainer} onPress={() => console.log('Open industry picker')}>
        <MaterialIcons name="business" size={20} color="#666" style={styles.inputIcon} />
        <Text style={styles.periodText}>{industryText}</Text>
        <View style={styles.spacer} />
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderJobTypeContent = () => {
    const handleJobTypeToggle = (type) => {
      setJobTypes(prev => {
        if (prev.includes(type)) {
          return prev.filter(t => t !== type);
        } else {
          return [...prev, type];
        }
      });
    };

    return (
      <View style={styles.locationSalaryContent}>
        {/* Onsite Option */}
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleJobTypeToggle('onsite')}
        >
          <View style={[
            styles.checkboxButton,
            jobTypes.includes('onsite') && styles.checkboxButtonSelected
          ]}>
            {jobTypes.includes('onsite') && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.radioOptionText}>Onsite (Work from Office)</Text>
        </TouchableOpacity>

        {/* Remote Option */}
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleJobTypeToggle('remote')}
        >
          <View style={[
            styles.checkboxButton,
            jobTypes.includes('remote') && styles.checkboxButtonSelected
          ]}>
            {jobTypes.includes('remote') && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.radioOptionText}>Remote (Work from Home)</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDatePostedContent = () => (
    <View style={styles.locationSalaryContent}>
      {/* All */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setDatePosted('all')}
      >
        <View style={styles.radioButton}>
          {datePosted === 'all' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>All</Text>
      </TouchableOpacity>

      {/* Last Hour */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setDatePosted('last-hour')}
      >
        <View style={styles.radioButton}>
          {datePosted === 'last-hour' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Last Hour</Text>
      </TouchableOpacity>

      {/* Last 24 Hour */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setDatePosted('last-24-hour')}
      >
        <View style={styles.radioButton}>
          {datePosted === 'last-24-hour' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Last 24 Hour</Text>
      </TouchableOpacity>

      {/* Last 7 Days */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setDatePosted('last-7-days')}
      >
        <View style={styles.radioButton}>
          {datePosted === 'last-7-days' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Last 7 Days</Text>
      </TouchableOpacity>

      {/* Last 14 Days */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setDatePosted('last-14-days')}
      >
        <View style={styles.radioButton}>
          {datePosted === 'last-14-days' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Last 14 Days</Text>
      </TouchableOpacity>

      {/* Last 30 Days */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setDatePosted('last-30-days')}
      >
        <View style={styles.radioButton}>
          {datePosted === 'last-30-days' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Last 30 Days</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLevelContent = () => {
    const handleLevelToggle = (level) => {
      setLevels(prev => {
        if (prev.includes(level)) {
          return prev.filter(l => l !== level);
        } else {
          return [...prev, level];
        }
      });
    };

    return (
      <View style={styles.locationSalaryContent}>
        {/* Intern */}
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleLevelToggle('intern')}
        >
          <View style={[
            styles.checkboxButton,
            levels.includes('intern') && styles.checkboxButtonSelected
          ]}>
            {levels.includes('intern') && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.radioOptionText}>Intern</Text>
        </TouchableOpacity>

        {/* Junior */}
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleLevelToggle('junior')}
        >
          <View style={[
            styles.checkboxButton,
            levels.includes('junior') && styles.checkboxButtonSelected
          ]}>
            {levels.includes('junior') && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.radioOptionText}>Junior</Text>
        </TouchableOpacity>

        {/* Senior */}
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleLevelToggle('senior')}
        >
          <View style={[
            styles.checkboxButton,
            levels.includes('senior') && styles.checkboxButtonSelected
          ]}>
            {levels.includes('senior') && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.radioOptionText}>Senior</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSalaryContent = () => (
    <View style={styles.locationSalaryContent}>
      {/* Negotiable Salary Option */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setSalaryType('negotiable')}
      >
        <View style={styles.radioButton}>
          {salaryType === 'negotiable' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Negotiable Salary</Text>
      </TouchableOpacity>

      {/* Salary Range Option */}
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => setSalaryType('range')}
      >
        <View style={styles.radioButton}>
          {salaryType === 'range' && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioOptionText}>Salary Range</Text>
      </TouchableOpacity>

      {/* Salary Range Slider (only show when range is selected) */}
      {salaryType === 'range' && (
        <View style={styles.salarySliderContainer}>
          {/* Slider */}
          <View style={styles.sliderContainer}>
            <View 
              ref={sliderRef}
              style={styles.sliderTrack}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setSliderWidth(width);
              }}
              {...panResponder.panHandlers}
            >
              <View 
                style={[
                  styles.sliderFill, 
                  { 
                    left: `${(salaryRange.min / 20000) * 100}%`, 
                    width: `${((salaryRange.max - salaryRange.min) / 20000) * 100}%` 
                  }
                ]} 
              />
              
              {/* Min Thumb */}
              <TouchableOpacity 
                style={[
                  styles.sliderThumb, 
                  { left: `${(salaryRange.min / 20000) * 100}%` }
                ]}
                onPress={() => console.log('Min thumb pressed')}
              />
              
              {/* Max Thumb */}
              <TouchableOpacity 
                style={[
                  styles.sliderThumb, 
                  { left: `${(salaryRange.max / 20000) * 100}%` }
                ]}
                onPress={() => console.log('Max thumb pressed')}
              />
            </View>
          </View>
          
          {/* Range Display Box */}
          <View style={styles.rangeDisplayBox}>
            <Text style={styles.rangeDisplayText}>
              ${salaryRange.min} - ${salaryRange.max}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

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
                {category.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
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
        {filterCategories.map(renderFilterCategory)}
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
  // Salary slider styles
  salarySliderContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    top: -8, // Center the thumb on the track (track height 4px, thumb height 20px)
  },
  sliderValue: {
    position: 'absolute',
    bottom: 25,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    lineHeight: 14,
    flexShrink: 0,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
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
});

export default FilterScreen; 