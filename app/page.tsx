import type { Metadata } from "next";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import RefillForm from "@/components/RefillForm";
import Products from "@/components/Products";
import Delivery from "@/components/Delivery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getActiveCategories, getFeaturedProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Categories change rarely: regenerate the homepage at most every 5 minutes.
export const revalidate = 300;

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getActiveCategories({ revalidate }).catch(() => null),
    getFeaturedProducts(8, { revalidate }).catch(() => []),
  ]);

  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main id="contenido">
        <Hero />
        <Services />
        <RefillForm />
        <Products initialCategories={categories} />
        <FeaturedProducts products={featured} />
        <Delivery />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
