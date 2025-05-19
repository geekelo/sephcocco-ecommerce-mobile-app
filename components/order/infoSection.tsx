import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InfoItem {
  label: string;
  value: string;
}

interface InfoSectionProps {
  title: string;
  items: InfoItem[];
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, items }) => {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoSectionTitle}>{title}</Text>

      <View style={styles.infoSectionContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.infoItem}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default InfoSection;

const styles = StyleSheet.create({
  infoSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoSectionContent: {
    flexDirection: 'column',
    gap: 12, // gap is not supported in RN, replaced below with marginBottom
  },
  infoItem: {
    marginBottom: 12, // gap substitute
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#777',
    lineHeight: 21, // 1.5 * 14
  },

  // Responsive styles handled with percentage, Dimensions or Platform if needed
});
