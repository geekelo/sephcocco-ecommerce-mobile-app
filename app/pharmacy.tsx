import { HeroPage } from "@/components/home/Hero";
import ProductList from "@/components/home/NewlyProductList";
import TopSeller from "@/components/home/TopSeller";
import { Layout } from "@/components/layout/Layout";
import { useOutlet } from "@/context/outletContext";
import { useAuth } from "@/context/authContext";
import { router } from "expo-router";
import { Text } from "react-native";
import { Routes } from "@/routes";
import React, { useState, useCallback } from 'react';

export default function PharmacyPage() {
  const { activeOutlet } = useOutlet();
  const { user } = useAuth();
  
  const isLoggedIn = !!user;
  const userId = user?.id ?? null;

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleLoginPrompt = () => {
    router.push(Routes.auth.login);
  };

  // Callback functions for HeroPage
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const handleFilterChange = useCallback((filter: string | null) => {
    setSelectedFilter(filter);
  }, []);

  return (
    <Layout>
      <HeroPage 
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedFilter={selectedFilter}
      />
      
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
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedFilter={selectedFilter}
          />
        </>
      )}
    </Layout>
  );
}