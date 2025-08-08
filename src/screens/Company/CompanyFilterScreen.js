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
import companyService from '../../services/companyService';
import { JobService } from '../../services/JobService';

const CompanyFilterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get saved filters from route params
  const savedFilters = route.params?.savedFilters || {};
  
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    location: savedFilters.location || '',
    industry: savedFilters.industry || '',
    companySize: savedFilters.companySize || '',
  });
  const [locationText, setLocationText] = useState(savedFilters.locationText || 'Select Location');
  const [industryText, setIndustryText] = useState(savedFilters.industryText || 'Select Industry');
  const [companySizeText, setCompanySizeText] = useState(savedFilters.companySizeText || 'Select Company Size');

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

  // Company Size picker states
  const [showCompanySizeModal, setShowCompanySizeModal] = useState(false);
  const [companySizes, setCompanySizes] = useState([]);
  const [filteredCompanySizes, setFilteredCompanySizes] = useState([]);
  const [selectedCompanySize, setSelectedCompanySize] = useState(null);
  const [loadingCompanySizes, setLoadingCompanySizes] = useState(false);
  const [companySizeSearchText, setCompanySizeSearchText] = useState('');

  // Load provinces, industries, and company sizes on component mount
  useEffect(() => {
    loadProvinces();
    loadIndustries();
    loadCompanySizes();
  }, [loadProvinces]);

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

  const loadCompanySizes = async () => {
    try {
      setLoadingCompanySizes(true);
      const companySizesData = await companyService.getCompanySizes();
      setCompanySizes(companySizesData);
      setFilteredCompanySizes(companySizesData);
    } catch (error) {
      console.error('Error loading company sizes:', error);
    } finally {
      setLoadingCompanySizes(false);
    }
  };

  const handleSearchCompanySize = (text) => {
    setCompanySizeSearchText(text);
    if (text.trim() === '') {
      setFilteredCompanySizes(companySizes);
    } else {
      const filtered = companySizes.filter(size =>
        size.sizeName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCompanySizes(filtered);
    }
  };

  const handleLocationSelect = (province) => {
    setSelectedProvince(province);
    setLocationText(province.name);
    setSelectedFilters(prev => ({
      ...prev,
      location: province.name,
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
      industry: industry.industryName,
    }));
    setShowIndustryModal(false);
  };

  const openIndustryPicker = () => {
    setIndustrySearchText('');
    setFilteredIndustries(industries);
    setShowIndustryModal(true);
  };

  const handleCompanySizeSelect = (size) => {
    setSelectedCompanySize(size);
    setCompanySizeText(size.sizeName);
    setSelectedFilters(prev => ({
      ...prev,
      companySize: size.sizeName,
    }));
    setShowCompanySizeModal(false);
  };

  const openCompanySizePicker = () => {
    setCompanySizeSearchText('');
    setFilteredCompanySizes(companySizes);
    setShowCompanySizeModal(true);
  };

  const handleApply = () => {
    const savedFilterState = {
      location: selectedFilters.location,
      industry: selectedFilters.industry,
      companySize: selectedFilters.companySize,
      locationText: locationText,
      industryText: industryText,
      companySizeText: companySizeText,
    };

    navigation.navigate('MainTab', { 
      screen: 'Explore',
      params: {
        filters: selectedFilters,
        savedFilters: savedFilterState,
        filterType: 'company', // Add filter type indicator
      }
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFilterSelect = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleReset = () => {
    setSelectedFilters({
      location: '',
      industry: '',
      companySize: '',
    });
    setLocationText('Select Location');
    setIndustryText('Select Industry');
    setCompanySizeText('Select Company Size');
    setSelectedProvince(null);
    setSelectedIndustry(null);
    setSelectedCompanySize(null);
    setExpandedCategories([]);
  };

  const renderLocationContent = () => (
    <View style={styles.locationSalaryContent}>
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
      <TouchableOpacity style={styles.periodContainer} onPress={openIndustryPicker}>
        <MaterialIcons name="business" size={20} color="#666" style={styles.inputIcon} />
        <Text style={styles.periodText}>{industryText}</Text>
        <View style={styles.spacer} />
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderCompanySizeContent = () => (
    <View style={styles.locationSalaryContent}>
      <TouchableOpacity style={styles.periodContainer} onPress={openCompanySizePicker}>
        <MaterialIcons name="people" size={20} color="#666" style={styles.inputIcon} />
        <Text style={styles.periodText}>{companySizeText}</Text>
        <View style={styles.spacer} />
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>
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
            {category.id === 'location' && renderLocationContent()}
            {category.id === 'industry' && renderIndustryContent()}
            {category.id === 'companySize' && renderCompanySizeContent()}
          </View>
        )}
      </View>
    );
  };

  const filterCategories = [
    { id: 'location', title: 'Location' },
    { id: 'industry', title: 'Industry' },
    { id: 'companySize', title: 'Company Size' },
  ];

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
                keyExtractor={(item) => item.industryId?.toString()}
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

      {/* Company Size Picker Modal */}
      <Modal
        visible={showCompanySizeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompanySizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCompanySizeModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Company Size</Text>
              <TouchableOpacity
                onPress={() => setShowCompanySizeModal(false)}
                style={styles.closeIcon}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search company sizes..."
                value={companySizeSearchText}
                onChangeText={handleSearchCompanySize}
                placeholderTextColor="#999"
              />
            </View>

            {loadingCompanySizes ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading company sizes...</Text>
              </View>
            ) : filteredCompanySizes.length > 0 ? (
              <FlatList
                data={filteredCompanySizes}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.provinceItem,
                      selectedCompanySize?.id === item.id && styles.selectedProvinceItem
                    ]}
                    onPress={() => handleCompanySizeSelect(item)}
                  >
                    <Text style={[
                      styles.provinceName,
                      selectedCompanySize?.id === item.id && styles.selectedProvinceName
                    ]}>
                      {item.sizeName}
                    </Text>
                    {selectedCompanySize?.id === item.id && (
                      <MaterialIcons name="check" size={20} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id?.toString()}
                showsVerticalScrollIndicator={false}
                style={styles.provinceList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="search-off" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>No company sizes found</Text>
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
    textAlign: 'center'
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
  inputIcon: {
    marginRight: 8,
  },
  spacer: {
    flex: 1,
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
});

export default CompanyFilterScreen; 