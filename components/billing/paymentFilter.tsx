import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, UIManager, LayoutAnimation } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MobilePaymentHistoryFilterProps {
  onFilterChange: (filters: { startDate: string; endDate: string; status: string }) => void;
}

export const MobilePaymentHistoryFilter: React.FC<MobilePaymentHistoryFilterProps> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  const handleFilterChange = (name: string, value: string) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters = { startDate: '', endDate: '', status: '' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const toggleFilterView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleFilterView}>
        <Text style={styles.title}>Filter Transactions</Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.filterContent}>
          <View style={styles.filterField}>
            <Text style={styles.label}>From Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={filters.startDate}
              onChangeText={(text) => handleFilterChange('startDate', text)}
            />
          </View>

          <View style={styles.filterField}>
            <Text style={styles.label}>To Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={filters.endDate}
              onChangeText={(text) => handleFilterChange('endDate', text)}
            />
          </View>

          <View style={styles.filterField}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                style={styles.picker}
              >
                <Picker.Item label="All Statuses" value="" />
                <Picker.Item label="Success" value="success" />
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Failed" value="failed" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterContent: {
    marginTop: 16,
  },
  filterField: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    width: '100%',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
});
