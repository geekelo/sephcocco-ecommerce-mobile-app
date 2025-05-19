import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { Card } from "../common/ProductCard";

type SimilarProduct = {
  id: number;
  image: any;
  title: string;
  favorites: number;
  amount: string;
  stock: number;
};

type Props = {
  similar: SimilarProduct[];
  onProductPress: (id: number) => void;
  
 title?: string;  
};

export default function SimilarProducts({ similar, onProductPress, title = "Similar Products"  }: Props) {
  const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = React.useState(0);

  const totalPages = Math.ceil(similar.length / itemsPerPage);

  const pagedSimilar = similar.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <View style={styles.similarContainer}>
      <View style={styles.similarHeader}>
       
        <ThemedText style={styles.similarTitle}>{title}</ThemedText>
        <View style={styles.paginationContainer}>
          <View
            style={[
              styles.iconWrapper,
              currentPage === 0 && styles.disabledIconWrapper,
              { backgroundColor: "#FFEDE6" },
            ]}
          >
            <Entypo
              name="chevron-left"
              size={17}
              color={currentPage === 0 ? "#FF8754" : "#FF4C00"}
              onPress={handlePrevPage}
            />
          </View>

          <View
            style={[
              styles.iconWrapper,
              currentPage === totalPages - 1 && styles.disabledIconWrapper,
              { backgroundColor: "#FF4C00" },
            ]}
          >
            <Entypo
              name="chevron-right"
              size={17}
              color="#fff"
              onPress={handleNextPage}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={pagedSimilar}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <ThemedView style={styles.cardWrapper}>
            <Card
              image={item.image}
              title={item.title}
              favorites={item.favorites}
              amount={item.amount}
              stock={item.stock}
              onPress={() => onProductPress(item.id)}
            />
          </ThemedView>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  similarContainer: {
    marginTop: 30,
  },

  similarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  similarTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledIconWrapper: {
    backgroundColor: "gray",
    opacity: 0.6,
  },

  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
  },

  cardWrapper: {
    width: "48%",
    marginBottom: 30,
  },
});
