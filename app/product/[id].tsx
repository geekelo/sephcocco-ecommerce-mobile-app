import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/common/SearchBar";
import { useState } from "react";
import { productData } from "@/components/common/ProductData";
import CustomButton from "@/components/ui/CustomButton";
import { CustomOutlineButton } from "@/components/ui/CustomOutlineButton";
import {  Ionicons } from "@expo/vector-icons";
import { StarRating } from "@/components/common/ratingCard";
import SimilarProducts from "@/components/products/similarProducts";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
type SimilarProduct = {
  id: number;
  image: any;
  title: string;
  favorites: number;
  amount: string;
  stock: number;
};

type Product =
  | {
      id: number;
      image: any;
      subImages: any[];
      title: string;
      favorites: number;
      amount: string;
      stock: number;
      description: string;
      discount: number;
      similar: SimilarProduct[];
    }
  | undefined;

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const navigation = useNavigation();

  const [filterOpen, setFilterOpen] = useState(false);

  // Assuming productData is imported and available
  const product: Product = productData.find((p) => p.id === Number(id));

  const toggleFilter = () => setFilterOpen(!filterOpen);

  if (!product) {
    return (
      <Layout>
        <ThemedText style={{ padding: 20, color: "red" }}>
          Product not found.
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
          {/* Main Image */}
          <Image source={product.image} style={styles.images} />

          {/* Sub Images */}
          <View
            style={[styles.subImageContainer, { borderColor: theme.orange }]}
          >
            {product.subImages.map((img, idx) => (
              <Image key={idx} source={img} style={styles.subImage} />
            ))}
          </View>

          <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
            {product.title}
          </ThemedText>
          <ThemedText fontFamily="Raleway-Regular" style={styles.stock}>
            In stock: {product.stock} items
          </ThemedText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <StarRating rating={Math.min(5, product.favorites / 10)} />
            <ThemedText>({product.favorites} )</ThemedText>
          </View>

          <ThemedText style={styles.amount}>{product.amount}</ThemedText>

          <ThemedView>
            <ThemedText
              fontFamily="Raleway-Regular"
              style={styles.descriptionheader}
            >
              Product Description
            </ThemedText>
            <ThemedText fontFamily="Raleway-Regular" style={styles.description}>
              {product.description}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.gray}
            />
            <ThemedText style={{ color: theme.gray }}>Make Enquires</ThemedText>
          </ThemedView>
          <ThemedView style={styles.btns}>
            <CustomButton
              onPress={() => {
                router.push("/Billing");
              }}
              text="Add to pending orders"
              style={{
                backgroundColor: theme.pink,
                paddingVertical: 24,
                width: "45%",
              }}
              textStyle={{ color: "#333" }}
            />
            <CustomButton
              onPress={() => {
                router.push("/Billing");
              }}
              text="Buy Now"
              style={{ paddingVertical: 24, width: "45%" }}
            />
          </ThemedView>
          {/* Similar Products */}
          {product.similar?.length > 0 && (
            <SimilarProducts
              similar={product.similar}
              onProductPress={(id) =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: String(id) },
                })
              }
            />
          )}

          <CustomOutlineButton
            title="Have any Questions? Send us a message"
            color={theme.orange}
            onPress={() => alert("Button pressed!")}
            style={styles.bottomOutlineButton}
          />
        </ScrollView>
      </View>
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
