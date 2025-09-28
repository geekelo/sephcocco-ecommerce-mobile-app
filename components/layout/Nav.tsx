import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  Dimensions,
  Animated,
  BackHandler,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { Colors } from "@/constants/Colors";
import { Link, useRouter, usePathname } from "expo-router";
import { useOutlet } from "@/context/outletContext";
import { Routes } from "@/routes";
import { getUser, logout } from "@/lib/tokenStorage";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

type Outlet = "restaurant" | "pharmacy" | "lounge";

interface NavItem {
  href: string;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
}

interface StoreItem {
  key: Outlet;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
}

export function NavBar() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarAnim] = useState(new Animated.Value(-windowWidth));
  const [overlayOpacity] = useState(new Animated.Value(0));

  const { activeOutlet, setActiveOutlet } = useOutlet();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const navItems: NavItem[] = [
    { href: "/ProductPage", label: "Products", icon: "shopping-bag" },
    { href: "/pendingOrder", label: "Pending", icon: "clock" },
    { href: "/completed", label: "Completed", icon: "check-circle" },
    { href: "/paymentHistory", label: "Payment History", icon: "credit-card" },
    { href: "/mainMessage", label: "Messages", icon: "message-circle" },
  ];

  const storeItems: StoreItem[] = [
    { 
      key: "restaurant", 
      label: "Restaurant", 
      icon: "coffee",
      description: "Food & Dining"
    },
    { 
      key: "pharmacy", 
      label: "Pharmacy", 
      icon: "heart",
      description: "Health & Medicine"
    },
    { 
      key: "lounge", 
      label: "Lounge", 
      icon: "music",
      description: "Entertainment"
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUserId(user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (sidebarOpen) {
        closeSidebar();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    closeSidebar();
    router.replace('/auth/signIn');
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: -windowWidth,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setSidebarOpen(false);
      setDropdownOpen(false);
    });
  };

  const toggleSidebar = () => {
    if (sidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleOutletChange = (outlet: Outlet) => {
    setActiveOutlet(outlet);
    closeSidebar();
    router.push(`/${outlet}`);
  };

  const handleNavItemPress = (href:any) => {
    closeSidebar();
    router.push(href);
  };

  const isActiveRoute = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => (
    <TouchableOpacity
      key={item.href}
      style={[
        styles.navItem,
        isActiveRoute(item.href) && [
          styles.activeNavItem,
          { backgroundColor: `${theme.orange}15`, borderLeftColor: theme.orange }
        ]
      ]}
      onPress={() => handleNavItemPress(item.href)}
      accessibilityRole="button"
      accessibilityState={{ selected: isActiveRoute(item.href) }}
    >
      <View style={styles.navItemContent}>
        {item.icon && (
          <Feather
            name={item.icon}
            size={20}
            color={isActiveRoute(item.href) ? theme.orange : theme.text}
            style={styles.navItemIcon}
          />
        )}
        <ThemedText
          type="default"
          style={[
            styles.navItemText,
            {
              color: isActiveRoute(item.href) ? theme.orange : theme.text,
              fontWeight: isActiveRoute(item.href) ? "600" : "normal",
            },
          ]}
        >
          {item.label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <ThemedView
        style={[
          styles.navBarContainer,
          { backgroundColor: "#ffead1", borderBottomColor: theme.border, borderBottomWidth: 1 },
        ]}
      >
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/')}
          accessibilityLabel="Go to home"
          accessibilityRole="button"
        >
          <Image
            source={require("@/assets/images/SEPHCOCO LOUNGE 3.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="App Logo"
          />
        </TouchableOpacity>

        {/* User Profile / Login */}
        <View style={styles.rightSection}>
          {userId ? (
            <TouchableOpacity
              style={[
                styles.profileButton,
                { backgroundColor: `${theme.orange}20`, borderColor: theme.orange }
              ]}
              accessibilityLabel="User profile"
              accessibilityRole="button"
             
            >
              <Feather name="user" size={20} color={theme.orange} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.orange }]}
              onPress={() => router.push(Routes.auth.login)}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              <ThemedText type="default" style={styles.loginButtonText}>
                Login
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Hamburger Icon */}
          <TouchableOpacity
            onPress={toggleSidebar}
            style={[
              styles.hamburgerIcon,
              sidebarOpen && { backgroundColor: `${theme.orange}20` }
            ]}
            accessibilityLabel={sidebarOpen ? "Close menu" : "Open menu"}
            accessibilityRole="button"
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: sidebarOpen ? '180deg' : '0deg',
                  },
                ],
              }}
            >
              {sidebarOpen ? (
                <Entypo name="cross" size={28} color={theme.orange} />
              ) : (
                <Entypo name="menu" size={28} color={theme.text} />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Overlay */}
      {sidebarOpen && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={closeSidebar}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <Animated.View
          style={[
            styles.sidebar,
            {
              backgroundColor: theme.background,
              transform: [{ translateX: sidebarAnim }],
            },
          ]}
        >
        {/* Sidebar Header */}
        <View style={styles.sidebarHeader}>
          <Image
            source={require("@/assets/images/SEPHCOCO LOUNGE 3.png")}
            style={styles.logobox}
            resizeMode="contain"
            accessible
            accessibilityLabel="Sidebar Logo"
          />
          <TouchableOpacity
            style={styles.closeSidebarButton}
            onPress={closeSidebar}
            accessibilityLabel="Close sidebar"
          >
            <Entypo name="cross" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <View style={styles.navItemsContainer}>
          {navItems.map(renderNavItem)}

          {/* Stores Dropdown */}
          <View style={[styles.navItem, styles.storesSection]}>
            <TouchableOpacity
              onPress={toggleDropdown}
              style={styles.storeButton}
              accessibilityRole="button"
              accessibilityLabel={dropdownOpen ? "Collapse stores list" : "Expand stores list"}
            >
              <View style={styles.navItemContent}>
                <Feather name="shopping-bag" size={20} color={theme.text} style={styles.navItemIcon} />
                <ThemedText type="default" style={[styles.navItemText, { color: theme.text }]}>
                  Stores
                </ThemedText>
              </View>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: dropdownOpen ? '180deg' : '0deg',
                    },
                  ],
                }}
              >
                <Entypo name="chevron-down" size={20} color={theme.text} />
              </Animated.View>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownContainer}>
                {storeItems.map((store) => (
                  <TouchableOpacity
                    key={store.key}
                    style={[
                      styles.dropdownItem,
                      activeOutlet === store.key && [
                        styles.activeDropdownItem,
                        { backgroundColor: `${theme.orange}10` }
                      ]
                    ]}
                    onPress={() => handleOutletChange(store.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeOutlet === store.key }}
                  >
                    <View style={styles.storeItemContent}>
                      <View style={styles.storeIconContainer}>
                        <Feather
                          name={store.icon}
                          size={18}
                          color={activeOutlet === store.key ? theme.orange : theme.text}
                        />
                      </View>
                      <View style={styles.storeTextContainer}>
                        <ThemedText
                          type="default"
                          style={[
                            styles.storeTitle,
                            {
                              color: activeOutlet === store.key ? theme.orange : theme.text,
                              fontWeight: activeOutlet === store.key ? "600" : "500",
                            },
                          ]}
                        >
                          {store.label}
                        </ThemedText>
                        <ThemedText
                          type="default"
                          style={[
                            styles.storeDescription,
                            {
                              color: activeOutlet === store.key ? `${theme.orange}80` : `${theme.text}60`,
                            },
                          ]}
                        >
                          {store.description}
                        </ThemedText>
                      </View>
                      {activeOutlet === store.key && (
                        <View style={[styles.activeIndicator, { backgroundColor: theme.orange }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Background decoration */}
        <Image
          source={require("@/assets/images/Frame 1321317696.png")}
          style={styles.imageFrame}
          resizeMode="contain"
          accessible={false}
        />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {userId && (
            <TouchableOpacity
              style={[styles.logoutButton, { borderColor: theme.text }]}
              accessibilityRole="button"
              accessibilityLabel="Logout"
              onPress={handleLogout}
            >
              <Feather name="log-out" size={20} color={theme.text} />
              <ThemedText type="default" style={{ color: theme.text, marginLeft: 10 }}>
                Logout
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  logoContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  logo: {
    width: 43,
    height: 43,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  hamburgerIcon: {
    padding: 8,
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 99,
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: windowWidth * 0.8,
    height: windowHeight,
    zIndex: 100,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 5, height: 0 },
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logobox: {
    width: 39,
    height: 39,
  },
  closeSidebarButton: {
    padding: 8,
    borderRadius: 8,
  },
  navItemsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  navItem: {
   
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  activeNavItem: {
    borderLeftWidth: 3,
  },
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  navItemIcon: {
    marginRight: 12,
  },
  navItemText: {
    fontSize: 16,
  },
  storesSection: {
   
    borderLeftColor: "transparent",
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
   paddingRight:12
  },
  dropdownContainer: {
    paddingLeft: 8,
    paddingBottom: 8,
    paddingTop: 8,
  },
  dropdownItem: {
    borderRadius: 12,
    marginVertical: 3,
    marginHorizontal: 8,
  },
  activeDropdownItem: {
    borderRadius: 12,
  },
  storeItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: "relative",
  },
  storeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  storeTextContainer: {
    flex: 1,
  },
  storeTitle: {
    fontSize: 15,
    lineHeight: 18,
  },
  storeDescription: {
    fontSize: 12,
    lineHeight: 14,
    marginTop: 2,
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    position: "absolute",
    right: 12,
  },
  imageFrame: {
    width: 180,
    height: 180,
    position: "absolute",
    top: windowHeight * 0.4,
    left: windowWidth * 0.8 / 2 - 90,
    opacity: 0.1,
    zIndex: -1,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
});