import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Order } from '../types/types';
import { OrderStatusBadge } from './orderStatus';
import { Checkbox } from '../ui/checker';

type PendingOrderItemProps = {
  order: Order;
  index: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onClick: () => void;
  isSelected: boolean;
  isChecked: boolean;
  onToggleCheck: () => void;
};

export const PendingOrderItem: React.FC<PendingOrderItemProps> = ({
  order,
  index,
  quantity,
  onIncrease,
  onDecrease,
  onClick,
  isSelected,
  isChecked,
  onToggleCheck,
}) => {
  const totalPrice = order.price * quantity;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        isChecked && styles.checked,
      ]}
      activeOpacity={0.8}
      onPress={onClick}
    >
      {/* ✅ Use Checkbox component */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.();
          onToggleCheck();
        }}
      >
        <Checkbox
          checked={isChecked}
          onToggle={onToggleCheck}
          color="#32CD32"
          size={24}
        />
      </TouchableOpacity>

      <Image source={{ uri: order.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name}>{order.name}</Text>
          <Text style={styles.statusText}>Status: {order.status}</Text>
          <OrderStatusBadge status={order.status} />
        </View>

        <View style={styles.details}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onDecrease();
                }}
              >
                <Feather name="minus" size={16} />
              </TouchableOpacity>

              <Text style={styles.quantityValue}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onIncrease();
                }}
              >
                <Feather name="plus" size={16} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Unit Price:</Text>
              <Text style={styles.priceValue}>${order.price.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.priceLabel}>Total:</Text>
              <Text style={[styles.priceValue, styles.totalValue]}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
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
  checked: {
    backgroundColor: '#a5d6a7',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginLeft: 12,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  info: {
    marginBottom: 8,
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
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  quantityValue: {
    marginHorizontal: 10,
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 4,
  },
  totalValue: {
    color: '#32CD32',
  },
});
