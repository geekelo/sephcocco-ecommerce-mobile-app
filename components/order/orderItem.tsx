import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getStatusStyle, OrderStatusBadge } from './orderStatus';
import { Checkbox } from '../ui/checker';
import { Order } from '../types/types';
import { Ionicons } from '@expo/vector-icons';

interface OrderItemProps {
  order: Order;
  index: number;
  onpress?: () => void;
  checked?: boolean;
  onSeeMorePress?: () => void; // optional callback for see more details
}

export const OrderItem: React.FC<OrderItemProps> = ({
  order,
  index,
  onpress,
  checked = false,
  onSeeMorePress,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [quantity, setQuantity] = React.useState(1);
  const [isSelected, setIsSelected] = React.useState(checked);

  React.useEffect(() => {
    setIsSelected(checked);
  }, [checked]);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : q));

  const toggleCheckbox = () => {
    const newChecked = !isSelected;
    setIsSelected(newChecked);
    if (onpress) onpress();
  };

  const totalPrice = (order.price * quantity).toFixed(2);
  const borderColors = getStatusStyle(order.status);

  // Normalize status string to check for 'indelivery' ignoring spaces and case
  const normalizedStatus = order.status.toLowerCase().replace(/\s/g, '');
  const isInDelivery = normalizedStatus === 'indelivery';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(300)}
      style={[
        styles.orderItem,
        { borderColor: borderColors },
        isSelected && { backgroundColor: '#f8f8f8' }, // change bg when selected
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={order.image} style={styles.image} />
        <View style={styles.checkboxContainer}>
          <Checkbox
            checked={isSelected}
            onToggle={toggleCheckbox}
            size={28}
            color="#4CAF50"
          />
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.productOrderName}>{order.name}</Text>
        <Text style={styles.statusText}>Status: {order.status}</Text>
        <OrderStatusBadge status={order.status} />

       
            <View style={styles.quantityContainer}>
              <Text style={styles.statusText}>Quantity:</Text>
              <TouchableOpacity onPress={decrement} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={increment} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceTitle}>Unit Price:</Text>
                <Text style={styles.priceValue}>${order.price.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceTitle}>Total:</Text>
                <Text style={[styles.priceValue, { color: 'red' }]}>
                  ${totalPrice}
                </Text>
              </View>
            </View>
        
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    borderLeftWidth: 3,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  orderInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productOrderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    paddingBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  qtyBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
  priceContainer: {
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  priceTitle: {
    fontSize: 15,
    color: '#555',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },

  // New styles for "in delivery" view
  inDeliveryContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
    fontSize: 14,
  },
});
