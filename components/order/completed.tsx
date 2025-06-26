import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useOutlet } from "@/context/outletContext";
import { useGetCompletedOrders } from "@/mutation/useOrders";
import { getUser } from "@/lib/tokenStorage";
import SimilarProducts from "@/components/products/similarProducts";
import OrderModal from "@/components/order/orderModal";
import { getSimilarOrderProducts } from "../common/orderData";
import { Order } from "@/types/order";
import { DeliveryOrderItem } from "./deliverOrderItem";

const CompletedOrders = () => {
  const navigation = useNavigation();
  const { activeOutlet } = useOutlet();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    getUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  const {
    data: completedOrders,
    isLoading,
    error,
  } = useGetCompletedOrders(activeOutlet ?? "", userId);
console.log(completedOrders)
  const handleBack = () => navigation.goBack();
  const handleOrderClick = (order: Order) => setCurrentOrder(order);

  const similarDiscountProducts: any[] = currentOrder
    ? getSimilarOrderProducts(currentOrder)
    : [];

  const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
    const transformedOrder = {
      ...item,
      name: item.product?.name,
      price: parseFloat(item.unit_price),
      image: item.product?.main_image_url
        ? item.product.main_image_url
        : "", // Handled in DeliveryOrderItem
    };

    return (
      <DeliveryOrderItem
        order={transformedOrder}
        index={index}
        isSelected={currentOrder?.id === item.id}
        onClick={() => handleOrderClick(transformedOrder)}
        onSeeMorePress={() => setShowOrderModal(true)}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Orders</Text>
      </View>

      {/* Body */}
      {isLoading ? (
        <Text style={styles.loadingText}>Loading orders...</Text>
      ) : error ? (
        <Text style={[styles.errorText]}>Failed to fetch orders.</Text>
      ) : (
        <FlatList
          data={completedOrders ?? []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.orderList}
          ListEmptyComponent={() => (
            <Text style={styles.noOrdersText}>No completed orders.</Text>
          )}
        />
      )}

      {/* Similar Discounts */}
      {similarDiscountProducts.length > 0 && (
        <View style={styles.similarDiscountsContainer}>
          <SimilarProducts
            similar={similarDiscountProducts}
            onProductPress={(id) => navigation.navigate("product", { id })}
            title="Similar Discounts"
          />
        </View>
      )}

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderModal(false)}
      >
        <OrderModal
          visible={true}
          product={currentOrder as any}
          onClose={() => setShowOrderModal(false)}
          outlet={activeOutlet ?? ""}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backBtn: {
    position: "absolute",
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
  orderList: {
    paddingBottom: 12,
  },
  noOrdersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginTop: 48,
  },
  similarDiscountsContainer: {
    marginTop: 32,
  },
});

export default CompletedOrders;
