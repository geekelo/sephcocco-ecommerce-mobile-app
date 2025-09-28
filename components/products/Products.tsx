import { Colors } from "@/constants/Colors";
import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  View,
  Platform,
} from "react-native";
import { Card } from "../common/ProductCard";
import { SearchBar } from "../common/SearchBar";
import { ThemedView } from "../ThemedView";
import { CustomOutlineButton } from "../ui/CustomOutlineButton";
import { router } from "expo-router";
import { useOutlet } from "@/context/outletContext"; 
import { getUser } from "@/lib/tokenStorage";
import { useLikeProduct, useProducts, useUnlikeProduct } from "@/mutation/useProducts";
import { useProductCategories } from "@/mutation/useCategory";
import { useCreateOrder } from "@/mutation/useOrders";
import { Pagination, usePagination } from "../common/pagination";
export default function Products() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { width } = useWindowDimensions();
  const { activeOutlet } = useOutlet();

  // State management for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // User state
  const [userId, setUserId] = useState<string | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Mutations
  const createOrderMutation = useCreateOrder(activeOutlet ?? "");
  const likeMutation = useLikeProduct(activeOutlet ?? "");
  const unlikeMutation = useUnlikeProduct(activeOutlet ?? "");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUserId(user?.id ?? null);
      setIsUserLoaded(true);
    };
    fetchUser();
  }, []);

  // API calls
  const {
    data: products,
    isLoading,
    error,
  } = useProducts(activeOutlet ?? "", userId);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useProductCategories(activeOutlet ?? "");

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item: any) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((item: any) =>
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
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
            const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
            const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          break;
        case 'Rating':
          filtered.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'Most Liked':
          filtered.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'Alphabetical':
          filtered.sort((a: any, b: any) => {
            const nameA = (a.title || a.name || '').toLowerCase();
            const nameB = (b.title || b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedFilter]);

  // Pagination setup - showing 12 items per page
  const {
    currentPage,
    totalPages,
    currentItems: paginatedProducts,
    handlePageChange,
    totalItems,
    itemsPerPage,
  } = usePagination(filteredProducts, 12);

  // Handler functions
  const toggleFilter = () => setFilterOpen(!filterOpen);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setFilterOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFilterOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedFilter(null);
  };

  // Layout calculations
  const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;
  const cardWidth = (width - 60 - (numColumns - 1) * 16) / numColumns;

  // Loading states
  if (!activeOutlet || !isUserLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={{ marginTop: 10, color: theme.text }}>Loading outlet...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={{ marginTop: 10, color: theme.text }}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", textAlign: 'center', paddingHorizontal: 20 }}>
          Failed to load products. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Bar */}
      <SearchBar
        onFilterToggle={toggleFilter}
        filterOpen={filterOpen}
        onFilterSelect={handleFilterSelect}
        onCategorySelect={handleCategorySelect}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory || selectedFilter) && (
        <View style={[styles.activeFiltersContainer, { backgroundColor: `${theme.orange}08` }]}>
          <Text style={[styles.activeFiltersTitle, { color: theme.text }]}>
            Active Filters:
          </Text>
          <View style={styles.filterChips}>
            {searchQuery && (
              <View style={[styles.filterChip, { backgroundColor: theme.orange || '#F93A01' }]}>
                <Text style={styles.filterChipText}>Search: "{searchQuery}"</Text>
              </View>
            )}
            {selectedCategory && (
              <View style={[styles.filterChip, { backgroundColor: theme.orange || '#F93A01' }]}>
                <Text style={styles.filterChipText}>Category: {selectedCategory}</Text>
              </View>
            )}
            {selectedFilter && (
              <View style={[styles.filterChip, { backgroundColor: theme.orange || '#F93A01' }]}>
                <Text style={styles.filterChipText}>{selectedFilter}</Text>
              </View>
            )}
            <TouchableOpacity onPress={clearFilters} style={[styles.clearButton, { borderColor: theme.orange }]}>
              <Text style={[styles.clearButtonText, { color: theme.orange }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsCount, { color: theme.text }]}>
            {totalItems} product{totalItems !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </Text>
          {totalPages > 1 && (
            <View style={[styles.pageIndicator, { backgroundColor: `${theme.orange}20` }]}>
              <Text style={[styles.pageIndicatorText, { color: theme.orange }]}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.text }]}>
            {searchQuery || selectedCategory || selectedFilter
              ? "No products match your search criteria."
              : "No products available at the moment."
            }
          </Text>
          {(searchQuery || selectedCategory || selectedFilter) && (
            <TouchableOpacity onPress={clearFilters} style={[styles.clearFiltersButton, { borderColor: theme.orange }]}>
              <Text style={[styles.clearFiltersButtonText, { color: theme.orange }]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <ThemedView style={styles.gridContainer}>
            {paginatedProducts.map((item: any) => (
              <ThemedView
                key={item.id}
                style={[styles.cardWrapper, { width: cardWidth }]}
              >
                <Card
                  image={{ uri: item.main_image_url || item.image_url }}
                  title={item.title || item.name}
                  favorites={item.likes}
                  out_of_stock_status={item.out_of_stock_status}
                  likedByUser={item.liked_by_user}
                  isLoggedIn={!!userId}
                  onLoginPrompt={() => alert("Login to like items")}
                  onToggleLike={() => {
                    if (!userId) {
                      alert("Login to like items");
                      return;
                    }

                    if (item.liked_by_user) {
                      unlikeMutation.mutate(item.id)
                    } else {
                      likeMutation.mutate(item.id)
                    }
                  }}
                  amount={`₦${item.price}`}
                  stock={item.amount_in_stock}
                  onPress={() => router.push(`/product/${item.id}`)}
                  outlet={activeOutlet}
                />
              </ThemedView>
            ))}
          </ThemedView>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showInfo={true}
              maxVisiblePages={5}
              style={styles.paginationStyle}
            />
          )}
        </>
      )}

      {/* Bottom Button */}
      <CustomOutlineButton
        title="Have any Questions? Send us a message"
        color={theme.orange || '#F93A01'}
        onPress={() => alert("Button pressed!")}
        style={styles.bottomOutlineButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 32 : 40,
    paddingBottom: 60,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 20,
    margin: 8,
    gap: 12,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 40,
  },
  bottomOutlineButton: {
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeFiltersContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 58, 1, 0.2)',
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    flex: 1,
  },
  pageIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paginationStyle: {
    marginTop: 20,
    marginBottom: 10,
  },
});