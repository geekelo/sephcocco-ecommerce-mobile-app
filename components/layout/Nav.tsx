import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { Colors } from "@/constants/Colors";
import { Link } from "expo-router";


const windowHeight = Dimensions.get('window').height;

const windowWidth = Dimensions.get("window").width;

export function NavBar() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); 

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <ThemedView
      style={[styles.navBarContainer, { backgroundColor: "#ffead1" }]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/SEPHCOCO LOUNGE 3.png")}
          style={styles.logo}
        />
      </View>

      {/* Hamburger Icon */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerIcon}>
        {sidebarOpen ? (
          <Entypo name="cross" size={30} color={theme.text} />
        ) : (
          <Entypo name="menu" size={30} color={theme.text} />
        )}
      </TouchableOpacity>

      {/* Sidebar */}
      {sidebarOpen && (
        <View style={[styles.sidebar, { backgroundColor: theme.background }]}>
          <Image
            source={require("@/assets/images/SEPHCOCO LOUNGE 3.png")}
            style={styles.logobox}
          />
          <Link
            href="/ProductPage"
            style={[
              styles.sidebarText,
              { color: theme.text, borderBottomColor: theme.border },
            ]}
            asChild
          >
            <ThemedText type="default">Products</ThemedText>
          </Link>

          {/* Image frame between Products and Pending Orders */}
          <Image
            source={require("@/assets/images/Frame 1321317696.png")} 
            style={[styles.imageFrame, { zIndex: -1 }]} 
          />

           <Link
            href="/pendingOrder"
            style={[
              styles.sidebarText,
              { color: theme.text, borderBottomColor: theme.border },
            ]}
            asChild
          >

          <ThemedText
            type="default"
            
          >
            Pending
          </ThemedText>
          </Link>
          <ThemedText
            type="default"
            style={[
              styles.sidebarText,
              { color: theme.text, borderBottomColor: theme.border },
            ]}
          >
            Completed
          </ThemedText>
           <Link
            href="/paymentHistory"
            style={[
              styles.sidebarText,
              { color: theme.text, borderBottomColor: theme.border },
            ]}
            asChild
          >
          <ThemedText
            type="default"
            style={[
              styles.sidebarText,
              { color: theme.text, borderBottomColor: theme.border },
            ]}
          >
            Payment History
          </ThemedText>
          </Link>
           <Link
            href="/message"
            style={[
              styles.sidebarText,
              { color: theme.text, borderBottomColor: theme.border },
            ]}
            asChild
          >
          <ThemedText
            type="default"
          
          >
            Messages
          </ThemedText>
          </Link>

          {/* Store Dropdown */}
          <View
            style={[styles.sidebarText, { borderBottomColor: theme.border }]}
          >
            <TouchableOpacity
              onPress={toggleDropdown}
              style={[styles.storeButton]}
            >
              <ThemedText type="default" style={[{ color: theme.text }]}>
                Stores
              </ThemedText>
              <Entypo
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdownItem}>
                  <ThemedText type="default" style={{ color: theme.text }}>
                    Restaurant
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <ThemedText type="default" style={{ color: theme.text }}>
                    Pharmacy
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <ThemedText type="default" style={{ color: theme.text }}>
                    Lounge
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.bottomIcons}>
            <TouchableOpacity style={styles.iconItem}>
              <Feather name="log-out" size={30} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <Feather name="user" size={30} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  logoContainer: {
    flex: 1,
  },
  logobox: {
    width: 39,
    height: 39,
    marginVertical: 40,
  },
  logo: {
    width: 43,
    height: 43,
  },
  hamburgerIcon: {
    padding: 10,
  },
  sidebar: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '75%',
  height: windowHeight * 0.98, // 90% of the screen height
  padding: 40,
  zIndex: 10,
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  elevation: 1,
},

  sidebarText: {
    paddingVertical: 20,
    borderBottomWidth: 0.4,
    zIndex: 10,
  },
  imageFrame: {
  width: 221,
  height: 226,
  marginVertical: 20,
  position: "absolute",
  top: 60,
  left: "50%",
  zIndex: -1,
  transform: [{ translateX: -141 / 2 }], // shift left by half width to center
},

  dropdownContainer: {
    paddingVertical: 7,
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    display: "flex",
    justifyContent: "space-between",
  },
  bottomIcons: {
    position: "absolute",
    bottom: 60,
    left: 40,
    gap: 40,
    display: "flex",
    flexDirection: "row",
  },

  iconItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconText: {
    color: "#fff",
    fontSize: 16,
  },
});
