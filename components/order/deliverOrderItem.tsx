import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Order } from '../types/types';
import { OrderStatusBadge } from './orderStatus';
import { Checkbox } from '../ui/checker';
type DeliveryOrderItemProps = {
  order: Order;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  onSeeMorePress: () => void;
};

export const DeliveryOrderItem: React.FC<DeliveryOrderItemProps> = ({
  order,
  index,
  onClick,
  isSelected,
  onSeeMorePress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      activeOpacity={0.8}
      onPress={onClick}
    >
      <View style={styles.leftColumn}>
        <Checkbox checked={isSelected} onToggle={onClick} />
        <Image source={{ uri: order.image }} style={styles.image} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{order.name}</Text>
        <Text style={styles.statusText}>Status: {order.status}</Text>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.actions}>
        <Text style={styles.price}>${order.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.seeMoreBtn} onPress={onSeeMorePress}>
          <Text style={styles.seeMoreText}>See More Details</Text>
          <Feather name="chevron-right" size={16} color="#32CD32" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  selected: {
    borderColor: '#32CD32',
    backgroundColor: '#e6f4ea',
  },
  leftColumn: {
    marginRight: 12,
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginTop: 6,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#32CD32',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    color: '#32CD32',
    marginRight: 4,
    fontWeight: '600',
  },
});
