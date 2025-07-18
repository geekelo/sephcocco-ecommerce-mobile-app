import { HeroPage } from "@/components/home/Hero";
import ProductList from "@/components/home/NewlyProductList";
import TopSeller from "@/components/home/TopSeller";
import { Layout } from "@/components/layout/Layout";
import { useOutlet } from "@/context/outletContext";
import { useAuth } from "@/context/authContext";
import { router } from "expo-router";
import { Text } from "react-native";
import { Routes } from "@/routes";

export default function PharmacyPage() {
  const { activeOutlet } = useOutlet();
  const { user } = useAuth();

  const isLoggedIn = !!user;
  const userId = user?.id ?? null;

  const handleLoginPrompt = () => {
    router.push(Routes.auth.login);
  };

  return (
    <Layout>
      <HeroPage />

      {activeOutlet !== "pharmacy" ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          You're viewing {activeOutlet?.toUpperCase()} instead of PHARMACY.
        </Text>
      ) : (
        <>
          <ProductList
            outlet="pharmacy"
            isLoggedIn={isLoggedIn}
            userId={userId}
            onLoginPrompt={handleLoginPrompt}
          />
         
        </>
      )}
    </Layout>
  );
}
