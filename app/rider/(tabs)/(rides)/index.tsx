import HomeScreen from "@/components/rider/home/home";
import { RideDetails } from "@/components/rider/home/rideDetails";
import RideHistoryScreen from "@/components/rider/ride_history/riderHistoryScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function Ride_history() {
  return (
    <View  style={styles.container}>
       
     <RideHistoryScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
   
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingTop:80
  },
 
});
