import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const OrderStatusBadge = ({ status }: { status: string }) => {
  // Function to map status to style
  const statusStyle = getStatusStyle(status);

  return (
    <Text style={[styles.badge, {backgroundColor:statusStyle}]}>
      {status}
    </Text>
  );
};

// Mapping status strings to styles
export const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivering':
      return '#9333ea';
    case 'processing order':
      return '#3b82f6';
    case 'processing payment':
      return '#f59e0b';
    case 'arrived':
      return '#16a34a';
    case 'awaiting payment':
      return '#6b7280';
    case 'completed':
      return '#059669';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    alignSelf: 'flex-start', // mimics inline-block width behavior
    maxWidth: '100%', // prevent overflow
  },
  delivering: {
    backgroundColor: '#9333ea',
  },
  processingOrder: {
    backgroundColor: '#3b82f6',
  },
  processingPayment: {
    backgroundColor: '#f59e0b',
  },
  arrived: {
    backgroundColor: '#16a34a',
  },
  awaitingPayment: {
    backgroundColor: '#6b7280',
  },
  completed: {
    backgroundColor: '#059669',
  },
  defaultBadge: {
    backgroundColor: '#6b7280',
  },
});
