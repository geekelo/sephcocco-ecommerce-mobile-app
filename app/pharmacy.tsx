import { HeroPage } from "@/components/home/Hero";
import ProductList from "@/components/home/NewlyProductList";
import TopSeller from "@/components/home/TopSeller";
import { Layout } from "@/components/layout/Layout";


export default function HomePage() {
  return (
    <Layout>
      <HeroPage />
     <ProductList />
     <TopSeller />
    </Layout>
  );
}
