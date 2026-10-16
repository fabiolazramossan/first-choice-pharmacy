"use client";

import StorefrontIntro from "@/components/StorefrontIntro";
import Services from "@/components/Services";
import RefillForm from "@/components/RefillForm";
import Products from "@/components/Products";
import Delivery from "@/components/Delivery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <main>
        <StorefrontIntro />
        <Products />
        <Services />
        <RefillForm />
        <Delivery />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
