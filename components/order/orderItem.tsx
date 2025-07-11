import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getStatusStyle, OrderStatusBadge } from './orderStatus';
import { Checkbox } from '../ui/checker';
import { Order } from '../types/types';
import { Ionicons } from '@expo/vector-icons';
import { useDeleteOrder, useUpdateOrder } from '@/mutation/useOrders';
import { useOutlet } from '@/context/outletContext';


const { width, height } = Dimensions.get('window');
interface OrderItemProps {
  order: Order;
  index: number;
  onpress?: () => void;
  checked?: boolean;
  userId: string;
  outlet: string;
}

export const OrderItem: React.FC<OrderItemProps> = ({
  order,
  index,
  onpress,
  checked = false,
  userId,
  outlet
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [quantity, setQuantity] = React.useState(1);
  const [isSelected, setIsSelected] = React.useState(checked);
 const { activeOutlet } = useOutlet();
  React.useEffect(() => {
    setIsSelected(checked);
  }, [checked]);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : q));
const toggleCheckbox = () => {
  const newChecked = !isSelected;
  setIsSelected(newChecked);

};




  const totalPrice = (order.price * quantity).toFixed(2);
  const borderColors = getStatusStyle(order.status);
const [isEditing, setIsEditing] = React.useState(false);

  // Normalize status string to check for 'indelivery' ignoring spaces and case
  const normalizedStatus = order.status.toLowerCase().replace(/\s/g, '');
  const isInDelivery = normalizedStatus === 'indelivery';
const updateMutation = useUpdateOrder(outlet);
const deleteMutation = useDeleteOrder(outlet);
const handleEditToggle = () => {
  if (isEditing) {
    // Now submitting the update
    handleEdit();
  } else {
    // Switching to edit mode
    setQuantity(order?.quantity); // preload current quantity
  }
  setIsEditing(!isEditing);
};

const handleEdit = () => {
  updateMutation.mutate(
    {
      id: order.id,
      user_id: userId,
      quantity,
      outlet,
    },
    {
      onSuccess: (data) => {
        Alert.alert('Success', 'Order updated successfully.');
        console.log(data)
      },
      onError: () => {
        Alert.alert('Error', 'Failed to update order.');
      },
    }
  );
};

const confirmDelete = () => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this order?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: handleDelete,
      },
    ]
  );
};

const handleDelete = () => {
  deleteMutation.mutate(order?.id, {
    onSuccess: (data) => {
      Alert.alert('Deleted', 'Order was deleted successfully.');
      console.log(data)
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete order.');
    },
  });
};

const getImageSource = () => {
  const uri = order?.products?.[0]?.main_image_url;

  // ✅ Only return if it's a valid HTTP(S) string
  if (
    typeof uri === 'string' &&
    uri.trim() !== '' &&
    (uri.startsWith('http://') || uri.startsWith('https://'))
  ) {
    return { uri };
  }

  // ✅ fallback image (e.g. local asset)
  return require('@/assets/images/logo.png');
};




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
 {/* <Image
  source={getImageSource()}
  style={styles.image}
  onError={() => console.warn("🖼️ Image failed to load")}
/> */}

  <View style={styles.checkboxContainer}>
   <TouchableOpacity
  onPress={toggleCheckbox}
  style={[
    styles.fakeCheckbox,
    { backgroundColor: isSelected ? '#4CAF50' : '#fff' },
  ]}
>
  {isSelected && <Text style={styles.fakeCheckmark}>✓</Text>}
</TouchableOpacity>

  </View>
</View>


      <View style={styles.orderInfo}>
        <Text style={styles.productOrderName}>{order.name}</Text>
        <Text style={styles.statusText}>Status: {order.status}</Text>
        <OrderStatusBadge status={order.status} />

       
           {isEditing && (
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
)}
{!isEditing && (
  <View style={styles.quantityContainer}>
    <Text style={styles.statusText}>Quantity: {order.quantity}</Text>
  </View>
)}


            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceTitle}>Unit Price:</Text>
                <Text style={styles.priceValue}>₦ {order.price}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceTitle}>Total:</Text>
                <Text style={[styles.priceValue, { color: 'red' }]}>
                  ₦ {totalPrice}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
 <TouchableOpacity
  style={styles.editBtn}
  onPress={handleEditToggle}
>
  <Ionicons
    name={isEditing ? 'checkmark-outline' : 'create-outline'}
    size={18}
    color="#fff"
  />
  <Text style={styles.actionText}>
    {isEditing ? 'Update' : 'Edit'}
  </Text>
</TouchableOpacity>



  <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
    <Ionicons name="trash-outline" size={18} color="#fff" />
    <Text style={styles.actionText}>Delete</Text>
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
    aspectRatio: 1.5,
    
  },
 image: {
  width: '100%',
  height: width * 0.5, // 50% of screen width
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
  fakeCheckbox: {
  width: 28,
  height: 28,
  borderWidth: 1.5,
  borderColor: '#ccc',
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
},
fakeCheckmark: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 18,
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
  actionButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 16,
  gap: 12,
},
editBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#4CAF50',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 6,
},
deleteBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f44336',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 6,
},
actionText: {
  color: '#fff',
  marginLeft: 6,
  fontWeight: '600',
  fontSize: 14,
},

});
