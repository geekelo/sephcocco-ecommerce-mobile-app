import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { getSimilarOrderProducts } from "../common/orderData";
import { Order, SimilarProduct } from "../types/types";
import { OrderItem } from "./orderItem";
import { useOutlet } from "@/context/outletContext";
import { 
  useGetPendingOrders, 
  useGetPaidOrders, 
  useGetCompletedOrders, 
  useGetDeliveringOrders
} from "@/mutation/useOrders";
import { getUser } from "@/lib/tokenStorage";
import { DeliveryOrderItem } from "./deliverOrderItem";
import OrderModal from "./orderModal";
import LoadingSpinner from "../common/loadingSpinner";

const { width } = Dimensions.get("window");

type OrderTab = "Pending" | "Paid" | "Delivery";

const PendingOrders = () => {
  const navigation = useNavigation();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  const { activeOutlet } = useOutlet();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<OrderTab>("Pending");
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Query hooks for different order states - Only fetch when we have userId and activeOutlet
  const shouldFetch = Boolean(userId && activeOutlet);

  const {
    data: pendingOrdersData,
    isLoading: loadingPending,
    error: pendingError,
    refetch: refetchPending,
  } = useGetPendingOrders(activeOutlet ?? "", userId);

  const {
    data: paidOrdersData,
    isLoading: loadingPaid,
    error: paidError,
    refetch: refetchPaid,
  } = useGetPaidOrders(activeOutlet ?? "", userId);

  // Note: Using useGetCompletedOrders for "Delivery" tab instead of useGetDeliveringOrders
  // This might need to be adjusted based on your actual API structure
  const {
    data: completedOrdersData,
    isLoading: loadingCompleted,
    error: completedError,
    refetch: refetchCompleted,
  } = useGetCompletedOrders(activeOutlet ?? "", userId );

  // Safely handle the data with fallbacks
  const pendingOrders = Array.isArray(pendingOrdersData) ? pendingOrdersData : [];
  const paidOrders = Array.isArray(paidOrdersData) ? paidOrdersData : [];
  const completedOrders = Array.isArray(completedOrdersData) ? completedOrdersData : [];

  // Debug logs
  console.log('Current Tab:', selectedTab);
  console.log('Pending Orders:', pendingOrders.length, pendingOrders);
  console.log('Paid Orders:', paidOrders.length, paidOrders);
  console.log('Completed Orders:', completedOrders.length, completedOrders);

  // Get current data based on selected tab
  const getCurrentData = () => {
    switch (selectedTab) {
      case "Pending":
        return { 
          orders: pendingOrders, 
          isLoading: loadingPending, 
          error: pendingError,
          refetch: refetchPending 
        };
      case "Paid":
        return { 
          orders: paidOrders, 
          isLoading: loadingPaid, 
          error: paidError,
          refetch: refetchPaid 
        };
      case "Delivery":
        return { 
          orders: completedOrders, 
          isLoading: loadingCompleted, 
          error: completedError,
          refetch: refetchCompleted 
        };
      default:
        return { 
          orders: [], 
          isLoading: false, 
          error: null,
          refetch: () => {} 
        };
    }
  };

  const { orders: displayedOrders, isLoading, error, refetch } = getCurrentData();
  const isButtonEnabled = selectedOrders.length > 0 && selectedTab === "Pending";

  const handleOrderClick = (order: Order) => {
    if (selectedTab !== "Pending") return; // Only allow selection for pending orders
    
    const exists = selectedOrders.some((o) => o.id === order.id);

    if (exists) {
      setSelectedOrders((prev) => prev.filter((o) => o.id !== order.id));
    } else {
      setSelectedOrders((prev) => [...prev, order]);
    }

    // Haptic feedback animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab: OrderTab) => {
    if (tab === selectedTab) return;

    // Animate tab change
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedTab(tab);
      setSelectedOrders([]); // Reset selection when changing tabs
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => navigation.goBack();
  
  const handleButtonPress = () => {
    if (selectedOrders.length === 0) {
      return;
    }
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getTabConfig = (tab: OrderTab) => {
    const configs = {
      Pending: {
        count: pendingOrders.length,
        color: "#f59e0b",
        icon: "clock-outline",
        bgColor: "#fef3c7",
      },
      Paid: {
        count: paidOrders.length,
        color: "#10b981",
        icon: "check-circle-outline",
        bgColor: "#d1fae5",
      },
      Delivery: {
        count: completedOrders.length,
        color: "#3b82f6",
        icon: "truck-delivery-outline",
        bgColor: "#dbeafe",
      },
    };
    return configs[tab];
  };

  const renderTabButton = (tab: OrderTab) => {
    const config = getTabConfig(tab);
    const isActive = selectedTab === tab;

    return (
      <TouchableOpacity
        key={tab}
        style={[
          styles.tab,
          isActive && { backgroundColor: config.color }
        ]}
        onPress={() => handleTabChange(tab)}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <MaterialCommunityIcons 
            name={config.icon as any} 
            size={18} 
            color={isActive ? "#fff" : config.color} 
          />
          <Text style={[
            styles.tabText,
            isActive && styles.activeTabText,
            !isActive && { color: config.color }
          ]}>
            {tab}
          </Text>
          <View style={[
            styles.badge,
            { backgroundColor: isActive ? "rgba(255,255,255,0.3)" : config.bgColor }
          ]}>
            <Text style={[
              styles.badgeText,
              { color: isActive ? "#fff" : config.color }
            ]}>
              {config.count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
    // Ensure we have proper data structure
    if (!item || !item.id) {
      console.warn('Invalid order item:', item);
      return null;
    }

    const product = item.product || {};
    const mainImageUrl =
      typeof product.main_image_url === "string" &&
      product.main_image_url.startsWith("http")
        ? product.main_image_url
        : undefined;

    const orderId = item.id;
    const quantity = quantities[orderId] ?? item.quantity ?? 1;

    const transformedOrder = {
      ...item,
      name: product.name || item.name || 'Unknown Product',
      price: parseFloat(item.unit_price || item.price || '0'),
      image: mainImageUrl || require("@/assets/images/logo.png"),
    };

    // Render different components based on tab
    if (selectedTab === "Pending") {
      return (
        <Animated.View 
          key={`pending-${item.id}-${index}`}
          style={[
            styles.orderItemContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <OrderItem
            order={transformedOrder}
            index={index}
            checked={selectedOrders.some((o) => o.id === item.id)}
            onpress={() => handleOrderClick(transformedOrder)}
            userId={userId ?? ""}
            outlet={activeOutlet ?? ""}
            quantity={quantity}
            onIncrease={() =>
              setQuantities((prev) => ({
                ...prev,
                [orderId]: (prev[orderId] ?? item.quantity ?? 1) + 1,
              }))
            }
            onDecrease={() =>
              setQuantities((prev) => ({
                ...prev,
                [orderId]: Math.max((prev[orderId] ?? item.quantity ?? 1) - 1, 1),
              }))
            }
          />
        </Animated.View>
      );
    } else {
      return (
        <Animated.View 
          key={`${selectedTab.toLowerCase()}-${item.id}-${index}`}
          style={[
            styles.orderItemContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <DeliveryOrderItem
            order={transformedOrder}
            index={index}
            isSelected={false} // No selection for paid/delivery orders
            onClick={() => {}} // No selection functionality
            onSeeMorePress={() =>
              router.push({
                pathname: "/order/[id]",
                params: { id: item.id },
              })
            }
          />
        </Animated.View>
      );
    }
  };

  const renderEmptyState = () => {
    const emptyStates = {
      Pending: {
        icon: "clock-outline",
        title: "No Pending Orders",
        subtitle: "All your orders have been processed or you haven't placed any orders yet.",
        color: "#f59e0b",
      },
      Paid: {
        icon: "check-circle-outline",
        title: "No Paid Orders",
        subtitle: "Orders that have been paid for will appear here.",
        color: "#10b981",
      },
      Delivery: {
        icon: "truck-delivery-outline",
        title: "No Delivered Orders",
        subtitle: "Completed deliveries will show up in this section.",
        color: "#3b82f6",
      },
    };

    const config = emptyStates[selectedTab];

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: config.color + "20" }]}>
          <MaterialCommunityIcons name={config.icon as any} size={64} color={config.color} />
        </View>
        <Text style={styles.emptyTitle}>{config.title}</Text>
        <Text style={styles.emptySubtitle}>{config.subtitle}</Text>
        
        {selectedTab === "Pending" && (
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: config.color }]}
            onPress={() => router.push("/pharmacy")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Show loading only if we're fetching and don't have any cached data
  if ((isLoading && !displayedOrders.length) || (!userId || !activeOutlet)) {
    return <LoadingSpinner />;
  }

  if (error && !refreshing && !displayedOrders.length) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Unable to Load Orders</Text>
          <Text style={styles.errorSubtitle}>Please check your connection and try again.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[
          styles.header,
          { opacity: fadeAnim }
        ]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <MaterialCommunityIcons 
              name="refresh" 
              size={20} 
              color={refreshing ? "#10b981" : "#6b7280"} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Tabs */}
        <Animated.View style={[
          styles.tabsContainer,
          { opacity: fadeAnim }
        ]}>
          {(["Pending", "Paid", "Delivery"] as OrderTab[]).map(renderTabButton)}
        </Animated.View>

        {/* Orders List */}
        <Animated.View style={[
          styles.listContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <FlatList
            data={displayedOrders}
            keyExtractor={(item, index) => `${selectedTab}-${item?.id || index}`}
            renderItem={renderOrderItem}
            contentContainerStyle={[
              styles.orderList,
              displayedOrders.length === 0 && styles.emptyList
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[getTabConfig(selectedTab).color]}
                tintColor={getTabConfig(selectedTab).color}
              />
            }
            ListEmptyComponent={renderEmptyState}
            removeClippedSubviews={false} // Helps with rendering issues
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </Animated.View>

        {/* Selection Footer - Only for Pending orders */}
        {selectedTab === "Pending" && (
          <Animated.View style={[
            styles.selectionFooter,
            { opacity: fadeAnim }
          ]}>
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>
                {selectedOrders.length > 0
                  ? `${selectedOrders.length} order${selectedOrders.length > 1 ? 's' : ''} selected`
                  : "Select orders to make payment"}
              </Text>
              {selectedOrders.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSelection}
                  onPress={() => setSelectedOrders([])}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearSelectionText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={[
                styles.paymentButton,
                !isButtonEnabled && styles.paymentButtonDisabled
              ]}
              onPress={handleButtonPress}
              disabled={!isButtonEnabled}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="credit-card" 
                size={20} 
                color={isButtonEnabled ? "#fff" : "#a0aec0"} 
              />
              <Text style={[
                styles.paymentButtonText,
                !isButtonEnabled && styles.paymentButtonTextDisabled
              ]}>
                {selectedOrders.length > 0 ? `Pay for ${selectedOrders.length} order${selectedOrders.length > 1 ? 's' : ''}` : "Make Payment"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Order Modal */}
        {showOrderModal && selectedOrders.length > 0 && (
          <OrderModal
            visible={showOrderModal}
            orders={selectedOrders}
            onClose={handleCloseModal}
            outlet={activeOutlet ?? ""}
          />
        )}
      </View>
    </>
  );
};

export default PendingOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: "#6b7280",
  },
  activeTabText: {
    color: "#fff",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  // List
  listContainer: {
    flex: 1,
  },
  orderList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  emptyList: {
    flexGrow: 1,
  },
  orderItemContainer: {
    marginBottom: 12,
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#1f2937",
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // Selection Footer
  selectionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: '500',
  },
  clearSelection: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearSelectionText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "600",
  },
  paymentButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: "#f3f4f6",
    elevation: 1,
    shadowOpacity: 0,
  },
  paymentButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  paymentButtonTextDisabled: {
    color: "#9ca3af",
  },
});