import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
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

export default function Products() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { width } = useWindowDimensions();
  const { activeOutlet } = useOutlet();
const [searchQuery, setSearchQuery] = useState("");
const [sortOption, setSortOption] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const createOrderMutation = useCreateOrder(activeOutlet ?? "");
const likeMutation = useLikeProduct(activeOutlet ?? "");
const unlikeMutation = useUnlikeProduct(activeOutlet ?? "");

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUserId(user?.id ?? null);
      setIsUserLoaded(true);
    };
    fetchUser();
  }, []);

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

  const toggleFilter = () => setFilterOpen(!filterOpen);

  const handleFilterSelect = (option: string) => {
    setSelectedFilter(option);
    if (option === "Categories") {
      setFilterOpen(false);
    }
  };


  
const filteredProducts = products
  ?.filter((item: any) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((item: any) =>
    selectedCategory ? item.category === selectedCategory : true
  )
  .sort((a: any, b: any) => {
    if (sortOption === "Price: Low to High") {
      return a.price - b.price;
    } else if (sortOption === "Price: High to Low") {
      return b.price - a.price;
    } else if (sortOption === "Newest First") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // fallback if createdAt exists
    } else if (sortOption === "A–Z") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "Z–A") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });


  const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;
  const cardWidth = (width - 60 - (numColumns - 1) * 16) / numColumns;

  if (!activeOutlet || !isUserLoaded) {
    return (
      <View style={styles.center}>
        <Text>Loading outlet...</Text>
      </View>
    );
  }

  if (isLoading || isCategoriesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (error || categoriesError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Failed to load data.</Text>
      </View>
    );
  }


  return (
    <ScrollView contentContainerStyle={styles.container}>
    <SearchBar
  onFilterToggle={toggleFilter}
  filterOpen={filterOpen}
  onFilterSelect={(filter) => {
    setSelectedFilter(filter);
    setSortOption(filter); // store sort type
  }}
  onCategorySelect={setSelectedCategory}
  onSearchChange={setSearchQuery}
/>



      {selectedFilter === "Categories" && (
        <View style={styles.categoryDropdown}>
          {isCategoriesLoading && (
            <ActivityIndicator size="small" color={theme.tint} />
          )}
          {categoriesError && (
            <Text style={{ color: "red" }}>Failed to load categories</Text>
          )}
          {categories?.map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                selectedCategory === cat.name && {
                  backgroundColor: theme.tint,
                },
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text
                style={{
                  color: selectedCategory === cat.name ? "#fff" : theme.text,
                  fontWeight: selectedCategory === cat.name ? "bold" : "normal",
                }}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading && (
        <ActivityIndicator
          size="large"
          color={theme.tint}
          style={{ marginTop: 60 }}
        />
      )}
      {error && (
        <Text style={{ textAlign: "center", color: "red", marginTop: 60 }}>
          Failed to load products.
        </Text>
      )}

      {!isLoading && isUserLoaded && products && (
        <ThemedView style={styles.gridContainer}>
          {products.map((item: any) => (
            <ThemedView
              key={item.id}
              style={[styles.cardWrapper, { width: cardWidth }]}
            >
              <Card
                image={{ uri: item.image_url }}
                title={item.title}
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
    unlikeMutation.mutate(item.id);
  } else {
    likeMutation.mutate(item.id);
  }
}}

                amount={`₦${item.price}`}
                stock={item.amount_in_stock}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: String(item.id) },
                  })
                }
                outlet={activeOutlet}
              />
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <CustomOutlineButton
        title="Have any Questions? Send us a message"
        color={theme.orange}
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
    paddingVertical: 40,
    margin: 8,
    gap: 12,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 60,
  },
  bottomOutlineButton: {
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
  categoryDropdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
