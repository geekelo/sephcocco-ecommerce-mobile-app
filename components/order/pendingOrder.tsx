import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router, useNavigation } from "expo-router";
import OrderModal from "@/components/order/orderModal";
import SimilarProducts from "@/components/products/similarProducts";
import { Feather } from "@expo/vector-icons";
import { getSimilarOrderProducts, orders } from "../common/orderData";
import { Order, SimilarProduct } from "../types/types";
import { OrderItem } from "./orderItem";
import { DeliveryItem } from "./deliveriItem";

const { width } = Dimensions.get("window");

const PendingOrders = () => {
  const navigation = useNavigation();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedTab, setSelectedTab] = useState<"Unpaid" | "InDelivery">(
    "Unpaid"
  );
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Filter orders by status
  const unpaidOrders = orders.filter((order) =>
    [
      "Processing Order",
      "Processing Payment",
      "Awaiting Payment Confirmation",
    ].includes(order.status)
  );
  const inDeliveryOrders = orders.filter(
    (order) => order.status === "Delivering"
  );

  // Decide which orders to show based on selected tab
  const displayedOrders =
    selectedTab === "Unpaid" ? unpaidOrders : inDeliveryOrders;

  const isButtonEnabled = !!currentOrder;

  const similarDiscountProducts: SimilarProduct[] = currentOrder
    ? getSimilarOrderProducts(currentOrder)
    : [];

  const handleBack = () => navigation.goBack();

  const handleOrderClick = (order: Order) => setCurrentOrder(order);

  const handleButtonPress = () => {
    if (isButtonEnabled) setShowOrderModal(true);
  };

  const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
    if (selectedTab === "Unpaid") {
      return (
        <OrderItem
          order={item}
          index={index}
          checked={currentOrder?.id === item.id}
          onpress={() => handleOrderClick(item)}
        />
      );
    }
    return (
      <DeliveryItem
        order={item}
        index={index}
        checked={currentOrder?.id === item.id}
        onpress={() => handleOrderClick(item)}
        link={`/order/${item.id}`}
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
        <Text style={styles.headerTitle}>Pending Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["Unpaid", "InDelivery"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => {
              setSelectedTab(tab as "Unpaid" | "InDelivery");
              setCurrentOrder(null);
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "Unpaid"
                ? `Unpaid (${unpaidOrders.length})`
                : `In Delivery (${inDeliveryOrders.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={displayedOrders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.orderList}
        ListEmptyComponent={() => (
          <Text style={styles.noOrdersText}>No orders in this category.</Text>
        )}
        renderItem={renderOrderItem}
      />

      {/* Action Button only on Unpaid tab */}
      {selectedTab === "Unpaid" && (
        <View style={styles.selectedOrderFooter}>
          <Text style={styles.selectedOrderText}>
            {currentOrder
              ? `${currentOrder.products.length} item(s) selected`
              : "No item selected"}
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, !isButtonEnabled && styles.disabledBtn]}
            disabled={!isButtonEnabled}
            onPress={handleButtonPress}
          >
            <Feather
              name="credit-card"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.actionBtnText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Similar products */}
      {similarDiscountProducts.length > 0 && (
        <View style={styles.similarDiscountsContainer}>
          <SimilarProducts
            similar={similarDiscountProducts}
            onProductPress={(id) => router.push(`/product/${id}`)}
            title="Similar Discounts"
          />
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderModal(false)}
      >
        <OrderModal
          visible={true}
          product={currentOrder as any} // If OrderModal expects Product, adapt accordingly
          onClose={() => setShowOrderModal(false)}
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
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginHorizontal: 12,
  },
  activeTab: {
    borderBottomColor: "#32CD32", // lime green
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#32CD32",
    fontWeight: "700",
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
  selectedOrderFooter: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  selectedOrderText: {
    fontSize: 16,
    paddingVertical: 18,
    color: "#333",
  },
  actionBtn: {
    backgroundColor: "#32CD32",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  disabledBtn: {
    backgroundColor: "#a5d6a7",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  similarDiscountsContainer: {
    marginTop: 32,
  },
});

export default PendingOrders;
