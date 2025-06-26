import React, { useEffect, useState } from "react";
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
import { Link, useRouter } from "expo-router"; // added useRouter for navigation
import { useOutlet } from "@/context/outletContext";
import { Routes } from "@/routes";
import { getUser } from "@/lib/tokenStorage";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

type Outlet = "restaurant" | "pharmacy" | "lounge";

export function NavBar() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { activeOutlet, setActiveOutlet } = useOutlet();
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const user = await getUser();
    setUserId(user?.id ?? null);
  };
  fetchUser();
}, []);

  const router = useRouter();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    if (dropdownOpen) setDropdownOpen(false); // close dropdown if sidebar closes
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleOutletChange = (outlet: Outlet) => {
    setActiveOutlet(outlet);
    setSidebarOpen(false);
    setDropdownOpen(false);
    router.push(`/${outlet}`);
  };

  return (
    <ThemedView
      style={[
        styles.navBarContainer,
        { backgroundColor: "#ffead1", borderBottomColor: theme.border, borderBottomWidth: 1 },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/SEPHCOCO LOUNGE 3.png")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="App Logo"
        />
      </View>

      {/* Login Link */}
      {userId ? (
  <TouchableOpacity
    style={styles.iconItem}
    accessibilityLabel="User profile"
    accessibilityRole="button"
    onPress={() => router.push('/')} // or any other screen
  >
    <Feather name="user" size={24} color={theme.text} />
  </TouchableOpacity>
) : (
  <Link
    href={Routes.auth.login}
    style={[styles.loginLink, { borderBottomColor: theme.orange }]}
    asChild
  >
    <ThemedText type="default" style={{ color: theme.text }}>
      Login
    </ThemedText>
  </Link>
)}


      {/* Hamburger Icon */}
      <TouchableOpacity
        onPress={toggleSidebar}
        style={styles.hamburgerIcon}
        accessibilityLabel={sidebarOpen ? "Close menu" : "Open menu"}
        accessibilityRole="button"
      >
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
            resizeMode="contain"
            accessible
            accessibilityLabel="Sidebar Logo"
          />

          <Link
            href="/ProductPage"
            style={[styles.sidebarText, { color: theme.text, borderBottomColor: theme.border }]}
            asChild
          >
            <ThemedText type="default">Products</ThemedText>
          </Link>

          <Image
            source={require("@/assets/images/Frame 1321317696.png")}
            style={styles.imageFrame}
            resizeMode="contain"
            accessible={false}
          />

          <Link
            href="/pendingOrder"
            style={[styles.sidebarText, { color: theme.text, borderBottomColor: theme.border }]}
            asChild
          >
            <ThemedText type="default">Pending</ThemedText>
          </Link>

           <Link
            href="/completed"
            style={[styles.sidebarText, { color: theme.text, borderBottomColor: theme.border }]}
            asChild
          >
            <ThemedText type="default">Completed</ThemedText>
          </Link>

          <Link
            href="/paymentHistory"
            style={[styles.sidebarText, { color: theme.text, borderBottomColor: theme.border }]}
            asChild
          >
            <ThemedText type="default">Payment History</ThemedText>
          </Link>

          <Link
            href="/message"
            style={[styles.sidebarText, { color: theme.text, borderBottomColor: theme.border }]}
            asChild
          >
            <ThemedText type="default">Messages</ThemedText>
          </Link>

          {/* Stores Dropdown */}
          <View style={[styles.sidebarText, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={toggleDropdown}
              style={styles.storeButton}
              accessibilityRole="button"
              accessibilityLabel={dropdownOpen ? "Collapse stores list" : "Expand stores list"}
            >
              <ThemedText type="default" style={{ color: theme.text }}>
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
                {(["restaurant", "pharmacy", "lounge"] as Outlet[]).map((store) => (
                  <TouchableOpacity
                    key={store}
                    style={styles.dropdownItem}
                    onPress={() => handleOutletChange(store)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeOutlet === store }}
                  >
                    <ThemedText
                      type="default"
                      style={{
                        color: activeOutlet === store ? theme.orange : theme.text,
                        fontWeight: activeOutlet === store ? "bold" : "normal",
                      }}
                    >
                      {store.charAt(0).toUpperCase() + store.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Bottom Icons */}
          <View style={styles.bottomIcons}>
            <TouchableOpacity
              style={styles.iconItem}
              accessibilityRole="button"
              accessibilityLabel="Logout"
            >
              <Feather name="log-out" size={30} color={theme.text} />
            </TouchableOpacity>
            {userId ? (
  <TouchableOpacity
    style={styles.iconItem}
    accessibilityLabel="User profile"
    accessibilityRole="button"
    onPress={() => router.push('/')} // or any other screen
  >
    <Feather name="user" size={24} color={theme.text} />
  </TouchableOpacity>
) : (
  <Link
    href={Routes.auth.login}
    style={[styles.loginLink, { borderBottomColor: theme.orange }]}
    asChild
  >
    <ThemedText type="default" style={{ color: theme.text }}>
      Login
    </ThemedText>
  </Link>
)}

           
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 43,
    height: 43,
  },
  loginLink: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.4,

  },
  hamburgerIcon: {
    padding: 10,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: windowWidth * 0.75,
    height: windowHeight,
    paddingTop: 60,
    paddingHorizontal: 30,
    zIndex: 100,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  logobox: {
    width: 39,
    height: 39,
    marginBottom: 40,
  },
  sidebarText: {
    paddingVertical: 16,
    borderBottomWidth: 0.4,
  },
  imageFrame: {
    width: 220,
    height: 220,
    position: "absolute",
    top: 90,
    left: windowWidth * 0.75 / 2 - 110,
    zIndex: -1,
  },
  dropdownContainer: {
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  bottomIcons: {
    position: "absolute",
    bottom: 60,
    left: 40,
    flexDirection: "row",
    gap: 40,
  },
  iconItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
