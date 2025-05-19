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
import { router } from 'expo-router';

interface OrderItemProps {
  order: Order;
  index: number;
  onpress?: () => void;
  checked?: boolean;
  onSeeMorePress?: () => void;
  link?: string; // 👈 NEW: link to navigate to
}


export const DeliveryItem: React.FC<OrderItemProps> = ({
  order,
  index,
  onpress,
  link,
  checked = false,
  onSeeMorePress,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [quantity, setQuantity] = React.useState(1);
  const [isSelected, setIsSelected] = React.useState(checked);

  React.useEffect(() => {
    setIsSelected(checked);
  }, [checked]);


  const totalPrice = (order.price * quantity).toFixed(2);
  const borderColors = getStatusStyle(order.status);

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
        
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.productOrderName}>{order.name}</Text>
        <Text style={styles.statusText}>Status: {order.status}</Text>
        <OrderStatusBadge status={order.status} />

         
          <View style={styles.inDeliveryContainer}>
            <Text style={styles.amountText}>Amount: ${totalPrice}</Text>
            
             <TouchableOpacity
  onPress={() => {
  if (link) {
  router.push({
    pathname: '/order/[id]',
    params: { id: String(order.id) },
  });
}
 else if (onSeeMorePress) {
      onSeeMorePress();
    }
  }}
  style={styles.seeMoreBtn}
  activeOpacity={0.7}
>
  <Text style={styles.seeMoreText}>See more details</Text>
  <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
</TouchableOpacity>

        
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
   
    position: 'relative',
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
    marginBottom: 6,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    paddingBottom: 6,
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
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom:12
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
