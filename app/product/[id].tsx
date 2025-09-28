import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  useColorScheme,
  Alert,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
  TextInput,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useOutlet } from "@/context/outletContext";
import { getUser } from "@/lib/tokenStorage";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/common/SearchBar";
import { StarRating } from "@/components/common/ratingCard";
import CustomButton from "@/components/ui/CustomButton";
import { CustomOutlineButton } from "@/components/ui/CustomOutlineButton";
import { useProductById, useProducts } from "@/mutation/useProducts";
import { useCreateOrder } from "@/mutation/useOrders";
import OrderModal from "@/components/order/orderModal";
import LoadingSpinner from "@/components/common/loadingSpinner";

const width = Dimensions.get("window").width;

function ProductDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const navigation = useNavigation();
  const { activeOutlet } = useOutlet();
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const productId = typeof id === "string" ? id : null;
  const [userId, setUserId] = useState<string | null>(null);
  
  // Enhanced search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Order form data state
  const [orderFormData, setOrderFormData] = useState({
    address: "",
    phone_number: "",
    additional_notes: ""
  });

  const { data: products } = useProducts(activeOutlet ?? "", userId);
  const {
    data: product,
    isLoading,
    isError,
  } = useProductById(activeOutlet ?? "", productId ?? "");
  const createOrderMutation = useCreateOrder(activeOutlet ?? "");

  useEffect(() => {
    getUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  // Enhanced filtering and searching logic
  const relatedProducts = useMemo(() => {
    if (!products || !product) return [];

    let filtered = products.filter((p: any) => p.id !== product.id);

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item: any) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter (prioritize same category as current product)
    if (selectedCategory) {
      filtered = filtered.filter((item: any) =>
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    } else if (product.category) {
      // Default to same category if no specific category selected
      const sameCategory = filtered.filter((item: any) =>
        item.category?.toLowerCase() === product.category?.toLowerCase()
      );
      const otherProducts = filtered.filter((item: any) =>
        item.category?.toLowerCase() !== product.category?.toLowerCase()
      );
      filtered = [...sameCategory, ...otherProducts];
    }

    // Apply sorting
    if (selectedFilter) {
      switch (selectedFilter) {
        case 'Price: Low to High':
          filtered.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'Price: High to Low':
          filtered.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'Newest First':
          filtered.sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          break;
        case 'Rating':
          filtered.sort((a: any, b: any) => (b.rating || b.likes || 0) - (a.rating || a.likes || 0));
          break;
        case 'Most Popular':
          filtered.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'Alphabetical':
          filtered.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
          break;
        default:
          break;
      }
    }

    return filtered.slice(0, 20); // Limit to 20 related products
  }, [products, product, searchQuery, selectedCategory, selectedFilter]);

  // Get unique categories for filtering
  const availableCategories = useMemo(() => {
    if (!products) return [];
    const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
    return categories.sort();
  }, [products]);

  const handlePlaceOrder = () => {
    if (!userId) {
      Alert.alert("Login Required", "Please login to place an order.");
      return;
    }
    if (!product || !activeOutlet) {
      Alert.alert("Error", "Missing product or outlet info.");
      return;
    }

    // Set initial order form data and show modal
    setOrderFormData({
      address: "",
      phone_number: "",
      additional_notes: "Buying directly from product page"
    });
    setOrderModalVisible(true);
  };

  const handleBuyNow = () => {
    if (!userId) {
      Alert.alert("Login Required", "Please login to place an order.");
      return;
    }
    if (!product || !activeOutlet) {
      Alert.alert("Error", "Missing product or outlet info.");
      return;
    }

    // Set initial order form data for buy now
    setOrderFormData({
      address: "",
      phone_number: "",
      additional_notes: "Buy now order"
    });

    // Create order first, then show modal
    const payload = {
      product_id: product.id,
      quantity: 1,
      outlet: activeOutlet,
      address: "", // Will be updated from modal
      phone_number: "", // Will be updated from modal
      additional_notes: "Buy now order",
    };

    createOrderMutation.mutate(payload, {
      onSuccess: (response) => {
        const orderId = response?.id || response?.data?.id;
        setCreatedOrderId(orderId);
        setOrderModalVisible(true);
        console.log(response)
      },
      onError: () => {
        Alert.alert("Error", "Failed to create order. Please try again.");
      },
    });
  };

  const handleModalClose = () => {
    setOrderModalVisible(false);
    setCreatedOrderId(null);
    setOrderFormData({
      address: "",
      phone_number: "",
      additional_notes: ""
    });
  };

  const toggleFilter = () => setFilterOpen(!filterOpen);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter === selectedFilter ? null : filter);
    setFilterOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedFilter(null);
    setShowSearchInput(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  if (!activeOutlet || !productId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Loading outlet or product ID...</ThemedText>
      </View>
    );
  }

  if (isLoading) {
     return (
       <Layout>
         <LoadingSpinner />
       </Layout>
     );
   }

  if (isError || !product) {
    return (
      <Layout>
        <ThemedText style={{ padding: 20, color: "red" }}>
          Failed to load product.
        </ThemedText>
      </Layout>
    );
  }

  const filterOptions = [
    "Price: Low to High",
    "Price: High to Low", 
    "Newest First",
    "Rating",
    "Most Popular",
    "Alphabetical"
  ];

  return (
    <Layout>
      <View style={{ flex: 1 }}>
        {/* Enhanced Search Bar */}
        <SearchBar
          onFilterToggle={toggleFilter}
          filterOpen={filterOpen}
          onFilterSelect={handleFilterSelect}
          onCategorySelect={handleCategorySelect}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          filterOptions={filterOptions}
          categories={availableCategories}
        />

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.closeButton, { backgroundColor: theme.background }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Product Images */}
          <Image source={{ uri: product.main_image_url }} style={styles.images} />

          <View style={[styles.subImageContainer, { borderColor: theme.orange }]}>
            {product.other_image_urls?.map((img: string, idx: number) => (
              <Image 
                key={idx} 
                source={{ uri: img }} 
                style={[styles.subImage, { borderColor: theme.border }]} 
              />
            ))}
          </View>

          {/* Product Info */}
          <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
            {product.name}
          </ThemedText>

          <ThemedText fontFamily="Raleway-Regular" style={[styles.stock, { color: theme.text }]}>
            In stock: {product.amount_in_stock} items
          </ThemedText>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <StarRating rating={Math.min(5, product.favorites / 10)} />
            <ThemedText>({product.likes})</ThemedText>
          </View>

          <ThemedText style={[styles.amount, { color: theme.orange }]}>₦ {product.price}</ThemedText>

          <ThemedView>
            <ThemedText style={styles.descriptionheader} fontFamily="Raleway-Regular">
              Product Description
            </ThemedText>
            <ThemedText style={styles.description} fontFamily="Raleway-Regular">
              {product.long_description}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.row}>
            <Ionicons name="information-circle-outline" size={20} color={theme.gray} />
            <ThemedText style={{ color: theme.gray }}>Make Enquiries</ThemedText>
          </ThemedView>

          {/* Action Buttons */}
          <ThemedView style={styles.btns}>
            <CustomButton
              text="Add to pending orders"
              icon={<Feather name="shopping-cart" size={18} color="#333" />}
              onPress={handlePlaceOrder}
              style={{ paddingVertical: 24, width: "45%", backgroundColor: theme.pink }}
              textStyle={{ color: "#333" }}
              disabled={createOrderMutation.isPending}
            />

            <CustomButton
              onPress={handleBuyNow}
              text={createOrderMutation.isPending ? "Creating..." : "Buy Now"}
              style={{ paddingVertical: 24, width: "45%", backgroundColor: theme.orange }}
              disabled={createOrderMutation.isPending}
            />
          </ThemedView>

          <CustomOutlineButton
            title="Have any Questions? Send us a message"
            color={theme.orange}
            onPress={() => alert("Button pressed!")}
            style={styles.bottomOutlineButton}
          />

          {/* Enhanced Related Products Section */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <ThemedText style={styles.relatedTitle}>
                  Related Products
                </ThemedText>
                <ThemedText style={[styles.relatedCount, { color: theme.text }]}>
                  {relatedProducts.length} items
                </ThemedText>
              </View>

              {/* Active Filters Display */}
              {(searchQuery || selectedCategory || selectedFilter) && (
                <View style={[styles.activeFiltersContainer, { backgroundColor: `${theme.orange}08` }]}>
                  <View style={styles.filterChips}>
                    {searchQuery && (
                      <View style={[styles.filterChip, { backgroundColor: theme.orange }]}>
                        <ThemedText style={styles.filterChipText}>"{searchQuery}"</ThemedText>
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <Feather name="x" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {selectedCategory && (
                      <View style={[styles.filterChip, { backgroundColor: theme.orange }]}>
                        <ThemedText style={styles.filterChipText}>{selectedCategory}</ThemedText>
                        <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                          <Feather name="x" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {selectedFilter && (
                      <View style={[styles.filterChip, { backgroundColor: theme.orange }]}>
                        <ThemedText style={styles.filterChipText}>{selectedFilter}</ThemedText>
                        <TouchableOpacity onPress={() => setSelectedFilter(null)}>
                          <Feather name="x" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity onPress={clearFilters} style={[styles.clearAllButton, { borderColor: theme.orange }]}>
                      <ThemedText style={[styles.clearAllText, { color: theme.orange }]}>Clear All</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Products Grid */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedProductsContainer}
              >
                {relatedProducts.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/product/${item.id}`)}
                    style={[styles.relatedProductCard, { backgroundColor: theme.background }]}
                  >
                    <Image
                      source={{ uri: item.main_image_url || item.image_url }}
                      style={styles.relatedProductImage}
                    />
                    <View style={styles.relatedProductInfo}>
                      <ThemedText numberOfLines={2} style={styles.relatedProductName}>
                        {item.name}
                      </ThemedText>
                      {item.category && (
                        <ThemedText style={[styles.relatedProductCategory, { color: theme.text }]}>
                          {item.category}
                        </ThemedText>
                      )}
                      <ThemedText style={[styles.relatedProductPrice, { color: theme.orange }]}>
                        ₦{item.price}
                      </ThemedText>
                      {item.likes > 0 && (
                        <View style={styles.relatedProductLikes}>
                          <Feather name="heart" size={12} color={theme.orange} />
                          <ThemedText style={styles.relatedProductLikesText}>
                            {item.likes}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* View All Button */}
              <TouchableOpacity 
                style={[styles.viewAllButton, { borderColor: theme.orange }]}
                onPress={() => router.push('/ProductPage')}
              >
                <ThemedText style={[styles.viewAllText, { color: theme.orange }]}>
                  View All Products
                </ThemedText>
                <Feather name="arrow-right" size={16} color={theme.orange} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      <OrderModal
        orders={[product]} 
        visible={orderModalVisible}
        onClose={handleModalClose}
        outlet={activeOutlet}
        orderId={createdOrderId}
        initialOrderData={orderFormData}
      />
    </Layout>
  );
}

export default ProductDetail

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    paddingBottom: 100,
    gap: 8,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    right: 20,
    borderRadius: 24,
    padding: 10,
    elevation: 5,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  images: {
    width: "100%",
    height: width * 0.9,
    resizeMode: "contain",
    marginBottom: 20,
    borderRadius: 12,
  },
  subImageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  subImage: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 10,
    resizeMode: "contain",
    marginBottom: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "600",
    paddingBottom: 6,
  },
  amount: {
    fontSize: width * 0.05,
    fontWeight: "700",
    marginBottom: 6,
  },
  stock: {
    fontSize: width * 0.04,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.7,
  },
  descriptionheader: {
    fontSize: width * 0.04,
    textDecorationLine: "underline",
    fontWeight: "600",
    paddingBottom: 12,
  },
  description: {
    fontSize: width * 0.038,
    lineHeight: 22,
    marginBottom: 20,
  },
  btns: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  bottomOutlineButton: {
    width: "100%",
    alignSelf: "center",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingVertical: 12,
  },
  relatedSection: {
    marginTop: 30,
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  relatedCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  activeFiltersContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 58, 1, 0.2)',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '500',
  },
  relatedProductsContainer: {
    paddingRight: 20,
  },
  relatedProductCard: {
    width: 140,
    marginRight: 16,
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  relatedProductImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  relatedProductInfo: {
    flex: 1,
  },
  relatedProductName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 16,
  },
  relatedProductCategory: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  relatedProductLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedProductLikesText: {
    fontSize: 11,
    opacity: 0.7,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});