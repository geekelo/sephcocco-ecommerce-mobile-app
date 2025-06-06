import { HeroPage } from "@/components/home/Hero";
import ProductList from "@/components/home/NewlyProductList";
import TopSeller from "@/components/home/TopSeller";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/authContext";
import { useOutlet } from "@/context/outletContext";
import { Routes } from "@/routes";
import { router } from "expo-router";
import { Text } from "react-native";

export default function RestaurantPage() {
  const { activeOutlet } = useOutlet();
   const { user } = useAuth(); // ⬅️ isLoggedIn = Boolean(user)
  
    const isLoggedIn = !!user;
  
    const handleLoginPrompt = () => {
      router.push(Routes.auth.login); // or use a modal
    };

  return (
    <Layout>
      <HeroPage />
      {activeOutlet !== 'restaurant' ? (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          You're viewing {activeOutlet?.toUpperCase()} instead of RESTAURANT.
        </Text>
      ) : (
        <>
                 <ProductList
                   outlet="restaurant"
                   isLoggedIn={isLoggedIn}
                   onLoginPrompt={handleLoginPrompt}
                 />
                 <TopSeller
                   outlet="restaurant"
                   isLoggedIn={isLoggedIn}
                   onLoginPrompt={handleLoginPrompt}
                 />
               </>
      )}
    </Layout>
  );
}
