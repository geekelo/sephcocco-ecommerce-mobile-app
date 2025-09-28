import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Card } from '../common/ProductCard';
import { router } from 'expo-router';
import axios from 'axios';
import { useLikeProduct, useProducts, useUnlikeProduct } from '@/mutation/useProducts';
import { useOutlet } from '@/context/outletContext';
import { Pagination, usePagination } from '../common/pagination';
type ProductListProps = {
  outlet: 'pharmacy' | 'restaurant' | 'lounge';
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
  userId: string | null;
  category?: string;
  searchQuery?: string;
  selectedCategory?: string | null;
  selectedFilter?: string | null;
  itemsPerPage?: number;
  showPaginationInfo?: boolean;
};

export default function ProductList({ 
  outlet, 
  isLoggedIn, 
  onLoginPrompt, 
  userId, 
  category,
  searchQuery = '',
  selectedCategory,
  selectedFilter,
  itemsPerPage = 8,
  showPaginationInfo = true
}: ProductListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();
  const { activeOutlet } = useOutlet();
  
  const { data, isLoading, error } = useProducts(outlet, userId);
  const likeMutation = useLikeProduct(activeOutlet ?? "");
  const unlikeMutation = useUnlikeProduct(activeOutlet ?? "");

  const numColumns = width > 768 ? 3 : width > 300 ? 2 : 1;
  const cardWidth = (width - 60 - (numColumns - 1) * 16) / numColumns;

  // Filter and sort products based on search query, category, and filter
  const filteredProducts = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply additional category filter from props (if any)
    if (category) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply sorting based on selectedFilter
    if (selectedFilter) {
      switch (selectedFilter) {
        case 'Price: Low to High':
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'Price: High to Low':
          filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'Newest First':
          filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          break;
        case 'Rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'Most Liked':
          filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'Alphabetical':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [data, searchQuery, selectedCategory, selectedFilter, category]);

  // Pagination setup
  const {
    currentPage,
    totalPages,
    currentItems: paginatedProducts,
    handlePageChange,
    totalItems,
    itemsPerPage: actualItemsPerPage,
  } = usePagination(filteredProducts, itemsPerPage);

  // Determine header text based on filters
  const getHeaderText = () => {
    if (searchQuery || selectedCategory || selectedFilter) {
      return `Filtered Products - ${outlet}`;
    }
    return `New Arrivals - ${outlet}`;
  };

  // Get results count text
  const getResultsText = () => {
    const count = filteredProducts.length;
    if (searchQuery || selectedCategory || selectedFilter || count === 0) {
      return `${count} product${count !== 1 ? 's' : ''} found`;
    }
    return null;
  };

  
  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { color: theme.text }]}>{getHeaderText()}</Text>
          <TouchableOpacity style={styles.seeAll}>
            <Text style={[styles.seeAllText, { color: theme.orange }]}>See All</Text>
            <Feather name="arrow-right" size={16} color={theme.orange} />
          </TouchableOpacity>
        </View>

        {/* Results count and pagination info */}
        <View style={styles.infoRow}>
          {getResultsText() && (
            <Text style={[styles.resultsCountText, { color: theme.text }]}>
              {getResultsText()}
            </Text>
          )}
          {totalPages > 1 && (
            <View style={[styles.pageIndicator, { backgroundColor: `${theme.orange}20` }]}>
              <Text style={[styles.pageIndicatorText, { color: theme.orange }]}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading products...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: 'red' }]}>
            Failed to load products. Please try again.
          </Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="package" size={48} color={theme.tabIconDefault} />
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
            No products found
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.text }]}>
            {searchQuery || selectedCategory || selectedFilter 
              ? "No products match your search criteria." 
              : "No products available at the moment."
            }
          </Text>
          {(searchQuery || selectedCategory || selectedFilter) && (
            <Text style={[styles.emptyStateHint, { color: theme.text }]}>
              Try adjusting your filters or search terms.
            </Text>
          )}
        </View>
      )}

      {/* Products Grid */}
      {!isLoading && !error && paginatedProducts.length > 0 && (
        <>
          <View style={styles.gridContainer}>
            {paginatedProducts.map((item: any) => (
              <View key={`${item.id}-${currentPage}`} style={[styles.cardWrapper, { width: cardWidth }]}>
                <Card
                  image={{ uri: item.image_url }}
                  title={item.name}
                  favorites={item.likes}
                  amount={`₦${item.price}`}
                  stock={item.amount_in_stock}
                  outlet={item.outlet}
                  isLoggedIn={isLoggedIn}
                  out_of_stock_status={item.out_of_stock_status}
                  likedByUser={item.liked_by_user}
                  onLoginPrompt={onLoginPrompt}
                  onToggleLike={() => {
                    if (!userId) {
                      if (onLoginPrompt) {
                        onLoginPrompt();
                      } else {
                        alert("Login to like items");
                      }
                      return;
                    }

                    if (item.liked_by_user) {
                      unlikeMutation.mutate(item.id);
                    } else {
                      likeMutation.mutate(item.id);
                    }
                  }}
                  onPress={() => router.push(`/product/${item.id}`)}
                />
              </View>
            ))}
          </View>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={actualItemsPerPage}
              onPageChange={handlePageChange}
              showInfo={showPaginationInfo}
              maxVisiblePages={3} // Reduced for mobile screens
              style={styles.paginationStyle}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 32 : 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
    flex: 1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  seeAllText: {
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    flex: 1,
  },
  pageIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pageIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  emptyStateHint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 24,
    columnGap: 16,
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  paginationStyle: {
    marginTop: 20,
    marginBottom: 10,
  },
});