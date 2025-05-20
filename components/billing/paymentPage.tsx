import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { payments } from './paymentdata';
import { MobilePaymentHistoryCard } from './paymentHistory';

export const PaymentHistoryScreen = () => {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Payment History</Text>

     

      <MobilePaymentHistoryCard payments={payments} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign:'center'
  },
  summaryBox: {
    backgroundColor: '#e0f2f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
  },
});
