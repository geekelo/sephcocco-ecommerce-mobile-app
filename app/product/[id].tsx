import React, { useEffect, useState } from "react";
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
import { useProductById } from "@/mutation/useProducts";
import { useCreateOrder } from "@/mutation/useOrders";
import OrderModal from "@/components/order/orderModal";


const width = Dimensions.get("window").width;
export default function ProductDetail() {
  const { id } = useLocalSearchParams(); // id is string | string[] | undefined
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const navigation = useNavigation();
  const { activeOutlet } = useOutlet();
const [orderModalVisible, setOrderModalVisible] = useState(false);

  const productId = typeof id === "string" ? id : null;
  const [userId, setUserId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    getUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  const {
    data: product,
    isLoading,
    isError,
  } = useProductById(activeOutlet ?? "", productId ?? "");

  const createOrderMutation = useCreateOrder(activeOutlet ?? "");

  const handlePlaceOrder = () => {
    if (!userId) {
      Alert.alert("Login Required", "Please login to place an order.");
      return;
    }

    if (!product || !activeOutlet) {
      Alert.alert("Error", "Missing product or outlet info.");
      return;
    }

    const payload = {
      product_id: product.id,
      quantity: 1,
      outlet: activeOutlet,
      address: "Test Address",
      phone_number: "08012345678",
      additional_notes: "Buying directly from product page",
    };
    console.log(payload)

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert("Success", "Order placed successfully!");
      },
      onError: () => {
        Alert.alert("Error", "Something went wrong. Please try again.");
      },
    });
  }
  const toggleFilter = () => setFilterOpen(!filterOpen);

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
        <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 40 }} />
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
    "Categories",
    "Rating",
  ];

  return (
    <Layout>
      <View style={{ flex: 1 }}>
        <SearchBar
          onFilterToggle={toggleFilter}
          filterOptions={filterOptions}
          filterOpen={filterOpen}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 100 : 80,
            right: 20,
            backgroundColor: "#f0f0f0",
            borderRadius: 24,
            padding: 10,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            zIndex: 1000,
          }}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container}>
          <Image source={{ uri: product.main_image_url }} style={styles.images} />

          <View style={[styles.subImageContainer, { borderColor: theme.orange }]}>
            {product.other_image_urls?.map((img: string, idx: number) => (
              <Image key={idx} source={{ uri: img }} style={styles.subImage} />
            ))}
          </View>

          <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
            {product.name}
          </ThemedText>

          <ThemedText fontFamily="Raleway-Regular" style={styles.stock}>
            In stock: {product.amount_in_stock} items
          </ThemedText>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <StarRating rating={Math.min(5, product.favorites / 10)} />
            <ThemedText>({product.likes})</ThemedText>
          </View>

          <ThemedText style={styles.amount}>₦ {product.price}</ThemedText>

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

          <ThemedView style={styles.btns}>
           

<CustomButton
  text="Add to pending orders"
  icon={<Feather name="shopping-cart" size={18} color="#333" />}
  onPress={handlePlaceOrder}
  style={{ paddingVertical: 24, width: '45%', backgroundColor: theme.pink }}
  textStyle={{ color: '#333' }}
/>


            <CustomButton
  onPress={() => setOrderModalVisible(true)}
  text="Buy Now"
  style={{ paddingVertical: 24, width: "45%" }}
/>

          </ThemedView>

          <CustomOutlineButton
            title="Have any Questions? Send us a message"
            color={theme.orange}
            onPress={() => alert("Button pressed!")}
            style={styles.bottomOutlineButton}
          />
        </ScrollView>
      </View>
      <OrderModal
  product={product}
  visible={orderModalVisible}
  onClose={() => setOrderModalVisible(false)}
   outlet={activeOutlet}
/>

    </Layout>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    paddingBottom: 100,
    gap: 8,
  },

  images: {
    width: "100%",
    height: width * 0.9,
    resizeMode: "contain",
    marginBottom: 20,
  },

  subImageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  subImage: {
    width: "23%", // roughly 4 in a row with space
    aspectRatio: 1,
    borderRadius: 10,
    resizeMode: "contain",
    marginBottom: 10,
    borderWidth: 0.5,
  },

  title: {
    fontSize: width * 0.06, // ~24-27 on normal screens
    fontWeight: "600",
    paddingBottom: 6,
  },

  amount: {
    fontSize: width * 0.045,
    fontWeight: "600",
    marginBottom: 6,
  },

  discount: {
    fontSize: width * 0.035,
    color: "green",
    marginBottom: 6,
  },

  stock: {
    fontSize: width * 0.04,
    fontWeight: "600",
    marginBottom: 4,
  },

  descriptionheader: {
    fontSize: width * 0.04,
    textDecorationLine: "underline",
    fontWeight: "600",
    paddingBottom: 12,
  },

  description: {
    fontSize: width * 0.038,
    lineHeight: 30,
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
});
