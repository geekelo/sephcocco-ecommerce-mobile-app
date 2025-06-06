import { HeroPage } from "@/components/home/Hero";
import ProductList from "@/components/home/NewlyProductList";
import TopSeller from "@/components/home/TopSeller";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/authContext";
import { useOutlet } from "@/context/outletContext";
import { Routes } from "@/routes";
import { router } from "expo-router";
import { Text } from "react-native";

export default function LoungePage() {
  const { activeOutlet } = useOutlet();

   const { user } = useAuth(); // ⬅️ isLoggedIn = Boolean(user)
  
    const isLoggedIn = !!user;
  
    const handleLoginPrompt = () => {
      router.push(Routes.auth.login); // or use a modal
    };
  return (
    <Layout>
      <HeroPage />
      {activeOutlet !== 'lounge' ? (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          You're viewing {activeOutlet?.toUpperCase()} instead of LOUNGE.
        </Text>
      ) : (
        <>
                 <ProductList
                   outlet="lounge"
                   isLoggedIn={isLoggedIn}
                   onLoginPrompt={handleLoginPrompt}
                 />
                 <TopSeller
                   outlet="lounge"
                   isLoggedIn={isLoggedIn}
                   onLoginPrompt={handleLoginPrompt}
                 />
               </>
      )}
    </Layout>
  );
}
