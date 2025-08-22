import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getSimilarOrderProducts } from "../common/orderData";
import { Order, SimilarProduct } from "../types/types";
import { OrderItem } from "./orderItem";
import { useOutlet } from "@/context/outletContext";
import { useGetPendingOrders, useGetPaidOrders } from "@/mutation/useOrders";
import { getUser } from "@/lib/tokenStorage";
import { DeliveryOrderItem } from "./deliverOrderItem";
import OrderModal from "./orderModal";

const { width } = Dimensions.get("window");

const PendingOrders = () => {
  const navigation = useNavigation();
  const { activeOutlet } = useOutlet();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"Unpaid" | "InDelivery">("Unpaid");
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    getUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  const {
    data: unpaidOrdersData,
    isLoading: loadingUnpaid,
    error: unpaidError,
  } = useGetPendingOrders(activeOutlet ?? "", userId);

  const {
    data: deliveryOrdersData,
    isLoading: loadingDelivery,
    error: deliveryError,
  } = useGetPaidOrders(activeOutlet ?? "", userId);

  const unpaidOrders = unpaidOrdersData ?? [];
  const inDeliveryOrders = deliveryOrdersData ?? [];

  const displayedOrders = selectedTab === "Unpaid" ? unpaidOrders : inDeliveryOrders;
  const isLoading = selectedTab === "Unpaid" ? loadingUnpaid : loadingDelivery;
  const error = selectedTab === "Unpaid" ? unpaidError : deliveryError;
  const isButtonEnabled = selectedOrders.length > 0;

  const similarDiscountProducts: SimilarProduct[] =
    selectedOrders.length > 0
      ? selectedOrders.flatMap(getSimilarOrderProducts)
      : [];

  const handleOrderClick = (order: Order) => {
    const exists = selectedOrders.some((o) => o.id === order.id);

    if (exists) {
      setSelectedOrders((prev) => prev.filter((o) => o.id !== order.id));
    } else {
      setSelectedOrders((prev) => [...prev, order]);
    }
  };

  const handleBack = () => navigation.goBack();
  
  const handleButtonPress = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to proceed with payment.");
      return;
    }
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    // Optionally reset selected orders after successful payment
    // setSelectedOrders([]);
  };

  const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
    const product = item.product || {};

    const mainImageUrl =
      typeof product.main_image_url === "string" &&
      product.main_image_url.startsWith("http")
        ? product.main_image_url
        : undefined;

    const transformedOrder = {
      ...item,
      name: product.name,
      price: parseFloat(item.unit_price),
      image: mainImageUrl
        ? { uri: mainImageUrl }
        : require("@/assets/images/logo.png"),
      products: [
        {
          id: product.id,
          name: product.name,
          price: parseFloat(item.unit_price),
          quantity: item.quantity,
          main_image_url: mainImageUrl,
        },
      ],
    };

    if (selectedTab === "Unpaid") {
      return (
        <OrderItem
          order={transformedOrder}
          index={index}
          checked={selectedOrders.some((o) => o.id === item.id)}
          onpress={() => handleOrderClick(transformedOrder)}
          userId={userId ?? ""}
          outlet={activeOutlet ?? ""}
        />
      );
    } else {
      return (
        <DeliveryOrderItem
          order={transformedOrder}
          index={index}
          isSelected={selectedOrders.some((o) => o.id === item.id)}
          onClick={() => handleOrderClick(transformedOrder)}
          onSeeMorePress={() =>
            router.push({
              pathname: "/order/[id]",
              params: { id: item.id },
            })
          }
        />
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText]}>Failed to fetch orders.</Text>
      </View>
    );
  }

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
              setSelectedOrders([]); // reset selection
            }}
            activeOpacity={0.7}
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

      {/* Orders */}
      <FlatList
        data={displayedOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#a0aec0" />
            <Text style={styles.noOrdersText}>No orders in this category.</Text>
          </View>
        )}
      />

      {/* Footer */}
      {selectedTab === "Unpaid" && (
        <View style={styles.selectedOrderFooter}>
          <Text style={styles.selectedOrderText}>
            {selectedOrders.length > 0
              ? `${selectedOrders.length} order(s) selected`
              : "Select orders to make payment"}
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn, 
              !isButtonEnabled && styles.disabledBtn
            ]}
            onPress={handleButtonPress}
            disabled={!isButtonEnabled}
            activeOpacity={0.8}
          >
            <Feather name="credit-card" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedOrders.length > 0 && (
        <OrderModal
          visible={showOrderModal}
          product={selectedOrders[0] as any} // Handle first selected order
          onClose={handleCloseModal}
          outlet={activeOutlet ?? ""}
        />
      )}
    </View>
  );
};


export default PendingOrders

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 8,
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: "#32CD32",
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: "#666",
    textAlign: 'center',
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  orderList: {
    paddingBottom: 120, // Space for footer
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  noOrdersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: "#e53e3e",
    textAlign: 'center',
  },
  selectedOrderFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedOrderText: {
    fontSize: 14,
    color: "#333",
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: "#32CD32",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledBtn: {
    backgroundColor: "#a5d6a7",
    elevation: 1,
    shadowOpacity: 0.1,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
