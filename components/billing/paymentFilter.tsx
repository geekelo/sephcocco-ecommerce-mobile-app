import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

// ✅ Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MobilePaymentHistoryFilterProps {
  onFilterChange: (filters: { startDate: string; endDate: string; status: string }) => void;
}

export const MobilePaymentHistoryFilter: React.FC<MobilePaymentHistoryFilterProps> = ({
  onFilterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleFilterView}>
        <Text style={styles.title}>Filter Transactions</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {/* Expandable Content */}
      {isExpanded && (
        <View style={styles.filterContent}>
          {/* Date Inputs */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#555" />
              <Text style={styles.dateText}>
                {filters.startDate || 'From Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#555" />
              <Text style={styles.dateText}>
                {filters.endDate || 'To Date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Show Date Pickers */}
          {showStartPicker && (
            <DateTimePicker
              value={filters.startDate ? new Date(filters.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) {
                  handleFilterChange('startDate', formatDate(date));
                }
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={filters.endDate ? new Date(filters.endDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) {
                  handleFilterChange('endDate', formatDate(date));
                }
              }}
            />
          )}

          {/* Status Dropdown */}
          <View style={styles.filterField}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                style={styles.picker}
              >
                <Picker.Item label="All Statuses" value="" />
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Confirmed" value="confirmed" />
                <Picker.Item label="Failed" value="failed" />
              </Picker>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
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
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    marginRight: 8,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  filterField: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
   
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
