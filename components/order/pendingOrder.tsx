import React, { useEffect, useState } from "react";
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
import { useOutlet } from "@/context/outletContext";
import { useGetAllOrders, useGetPaidOrders, useGetPendingOrders } from "@/mutation/useOrders";
import { getUser } from "@/lib/tokenStorage";
import { DeliveryOrderItem } from "./deliverOrderItem";

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
console.log('unpaid',unpaidOrders)
console.log('del',inDeliveryOrders)
  const displayedOrders =
    selectedTab === "Unpaid" ? unpaidOrders : inDeliveryOrders;

  const isLoading =
    selectedTab === "Unpaid" ? loadingUnpaid : loadingDelivery;

  const error =
    selectedTab === "Unpaid" ? unpaidError : deliveryError;

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
  const handleButtonPress = () => setShowOrderModal(true);
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
    // image: mainImageUrl
    //   ? { uri: mainImageUrl }
    //   : require("@/assets/images/logo.png"),
    products: [
      {
        id: product.id,
        name: product.name,
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
        // main_image_url: mainImageUrl,
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
    return <Text style={styles.actionBtnText}>Loading orders...</Text>;
  }

  if (error) {
    return (
      <Text style={[styles.activeTabText, { color: "red" }]}>
        Failed to fetch orders.
      </Text>
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
        ListEmptyComponent={() => (
          <Text style={styles.noOrdersText}>No orders in this category.</Text>
        )}
      />

      {/* Footer */}
      {selectedTab === "Unpaid" && (
        <View style={styles.selectedOrderFooter}>
          <Text style={styles.selectedOrderText}>
          {selectedOrders.length > 0
  ? `${selectedOrders.length} order(s) selected`
  : "No order selected"}

          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, !isButtonEnabled && styles.disabledBtn]}
           
            onPress={handleButtonPress}
          >
            <Feather name="credit-card" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
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
  product={selectedOrders[0] as any} // or handle multiple if supported
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
