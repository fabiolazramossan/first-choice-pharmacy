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

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main id="contenido">
        <Hero />
        <Services />
        <RefillForm />
        <Products />
        <Delivery />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
