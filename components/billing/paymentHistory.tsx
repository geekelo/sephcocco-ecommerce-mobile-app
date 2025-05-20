import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MobilePaymentHistoryFilter } from './paymentFilter';
import { Link } from 'expo-router';
type Payment = {
  date: string;
  status: string;
  amount: number;
  reference: string;
  orderNumber: string;
};

type Filters = {
  startDate: string;
  endDate: string;
  status: string;
};

type Props = {
  payments: Payment[];
};

export const MobilePaymentHistoryCard: React.FC<Props> = ({ payments: allPayments }) => {
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(allPayments);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    status: '',
  });

  useEffect(() => {
    applyFilters(filters);
  }, [filters, allPayments]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const applyFilters = (currentFilters: Filters) => {
    let result = [...allPayments];

    if (currentFilters.startDate) {
      const startDate = new Date(currentFilters.startDate);
      result = result.filter(payment => new Date(payment.date) >= startDate);
    }

    if (currentFilters.endDate) {
      const endDate = new Date(currentFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(payment => new Date(payment.date) <= endDate);
    }

    if (currentFilters.status) {
      result = result.filter(payment => payment.status.toLowerCase() === currentFilters.status.toLowerCase());
    }

    setFilteredPayments(result);
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Reference:</Text>
          <Text style={styles.value}>{item.reference}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Order Number:</Text>
          <Link href={`/order/${item.orderNumber}`} style={styles.orderLink}>
            {item.orderNumber}
          </Link>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MobilePaymentHistoryFilter onFilterChange={handleFilterChange} />

      {filteredPayments.length > 0 ? (
        <FlatList
          data={filteredPayments}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No matching transactions found</Text>
        </View>
      )}
    </View>
  );
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
      return styles.success;
    case 'pending':
      return styles.pending;
    case 'failed':
      return styles.failed;
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  cardDate: {
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  success: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: '#4CAF50',
  },
  pending: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    color: '#FF9800',
  },
  failed: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    color: '#F44336',
  },
  cardBody: {
    marginTop: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    color: '#666',
    fontWeight: '500',
  },
  value: {
    color: '#333',
    fontWeight: '600',
  },
  orderLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  noResults: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 15,
  },
});
