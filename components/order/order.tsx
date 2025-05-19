import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
const orders = [
  {
    id: '1',
    image: require('@/assets/images/logo.png'),
    title: 'Minimalist Chair',
    status: 'Pending',
    deliveryStatus: 'Delivering',
    amount: '$120.00',
  },
  {
    id: '2',
    image: require('@/assets/images/logo.png'),
    title: 'Wooden Table',
    status: 'Completed',
    deliveryStatus: 'Delivered',
    amount: '$340.00',
  },
];

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();

  const filteredOrders = orders.filter(order => 
    activeTab === 'Pending' ? order.status === 'Pending' : order.status === 'Completed'
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {['Pending', 'Completed'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as 'Pending' | 'Completed')}>
            <Text style={[
              styles.tabText,
              activeTab === tab && { color: theme.orange, fontWeight: 'bold' }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <ScrollView>
        {filteredOrders.map(order => (
          <View key={order.id} style={[styles.card, { borderColor: theme.gray }]}>
            <View style={styles.cardContent}>
              <Image source={order.image} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.title}>{order.title}</Text>
                <Text style={styles.status}>Status: {order.status}</Text>
                <Text style={styles.delivery}>Delivery: {order.deliveryStatus}</Text>
                <Text style={styles.amount}>Amount: {order.amount}</Text>
                {/* <TouchableOpacity onPress={() => navigation.navigate('OrderDetails' as never)}> */}
                  <Text style={[styles.link, { color: theme.orange }]}>See More Details</Text>
                {/* </TouchableOpacity> */}
              </View>
            </View>
          </View>
        ))}

        {/* Discount Section */}
        <View style={styles.discountSection}>
          <Text style={styles.discountHeader}>Enjoy Discount on Similar Products</Text>
          <TouchableOpacity style={[styles.discountBtn, { backgroundColor: theme.orange }]}>
            <Text style={[styles.discountBtnText, { color: theme.background }]}>View More Deals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  status: {
    fontSize: 12,
    color: '#666'
  },
  delivery: {
    fontSize: 12,
    color: '#999'
  },
  amount: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  link: {
    marginTop: 8,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  discountSection: {
    padding: 20,
    alignItems: 'center'
  },
  discountHeader: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12
  },
  discountBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  discountBtnText: {
    fontSize: 14,
    fontWeight: 'bold'
  }
});
