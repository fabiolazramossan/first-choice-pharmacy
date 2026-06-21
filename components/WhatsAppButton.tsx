"use client";

import { motion } from "framer-motion";
import { BRAND } from "@/lib/data";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={BRAND.whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 14 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-soft-lg sm:bottom-8 sm:right-8"
    >
      <span className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-[#25D366]" />
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.23.6 4.32 1.65 6.12L4 29l8-1.6a12 12 0 0 0 4.04.7c6.64 0 12.04-5.4 12.04-12.06C28.08 8.4 22.68 3 16.04 3Zm0 21.86c-1.86 0-3.6-.5-5.1-1.38l-.37-.22-4.36.87.93-4.24-.24-.39a9.84 9.84 0 0 1-1.5-5.26c0-5.46 4.45-9.9 9.94-9.9 5.3 0 9.94 4.4 9.94 9.9 0 5.5-4.45 9.9-9.94 9.9Zm5.46-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </motion.a>
  );
}
