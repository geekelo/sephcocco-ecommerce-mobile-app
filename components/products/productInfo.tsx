import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { OrderStatusBadge } from "../order/orderStatus";

interface ProductInfoProps {
  name: string;
  image: any;
  price: number;
  ratingCount?: number;
  status: string;
  likes: number;
  isFavorite: boolean;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  image,
  price,
  ratingCount = 0,
  status,
  likes,
  isFavorite,
}) => {
  const handleTrackOrder = () => {
    console.log("Track order");
  };

  const handleDiscardOrder = () => {
    console.log("Discard order");
  };

  const handleLike = (isLiked: boolean) => {
    console.log(`Product like status changed to: ${isLiked}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.statusRow}>
          <OrderStatusBadge status={status} />
        </View>

        <View style={styles.ratingRow}>
          <Ionicons
            name="heart-outline"
            size={18}
            color="#333"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.ratingCount}>({ratingCount})</Text>
        </View>

        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.discardButton}
          onPress={handleDiscardOrder}
        >
          <Text style={styles.discardButtonText}>Discard Order</Text>
          <MaterialIcons name="arrow-right-alt" size={20} color="#ff6b35" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductInfo;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginBottom: 16,
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ff6b35",

    justifyContent: "flex-start",
    alignContent: "flex-start",
  },
  left: {
    flexShrink: 0,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  right: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  statusRow: {
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff6b35",
  },
  actions: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  discardButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    justifyContent: "flex-end",
  },
  discardButtonText: {
    color: "#ff6b35",
    fontWeight: "500",
    fontSize: 14,
    margin: 8,
  },
  trackButton: {
    backgroundColor: "#ff6b35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  trackButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
});
