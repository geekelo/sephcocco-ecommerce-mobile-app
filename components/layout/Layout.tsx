import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NavBar } from './Nav';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <View style={styles.container}>
      {/* Fixed Top Navigation */}
      <NavBar />

      {/* Scrollable Content including children and footer */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {children}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30, // to avoid status bar area (optional)
  },
  scrollContent: {
    flexGrow: 1,
  
  },
});
