export const BRAND = {
  name: "First Choice Pharmacy",
  slogan: "Tu salud es nuestra prioridad",
  phone: "787-751-6646",
  phoneHref: "tel:+17877516646",
  whatsappHref: "https://wa.me/17877516646",
  whatsappText: "https://wa.me/17877516646?text=Hola%2C%20me%20gustar%C3%ADa%20m%C3%A1s%20informaci%C3%B3n",
  address: "86 C. Georgetti, San Juan, PR 00926",
  mapsEmbedSrc: "https://www.google.com/maps?q=86+C.+Georgetti,+San+Juan,+PR+00926&output=embed",
  mapsLinkSrc: "https://www.google.com/maps/search/?api=1&query=86+C.+Georgetti,+San+Juan,+PR+00926",
};

export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Servicios", href: "#services" },
  { label: "Refill", href: "#refill" },
  { label: "Productos", href: "#products" },
  { label: "Health Hub", href: "#healthhub" },
  { label: "Contacto", href: "#contact" },
];

export const HOURS = [
  { day: "Lun – Vie", time: "7:00 AM – 7:00 PM" },
  { day: "Sábado", time: "8:00 AM – 6:00 PM" },
  { day: "Domingo", time: "10:00 AM – 5:00 PM" },
];

export type Service = {
  icon: "pill" | "syringe" | "truck" | "baby" | "leaf" | "sparkles";
  title: string;
  description: string;
  color: string;
  bg: string;
};

export const SERVICES: Service[] = [
  { icon: "pill", title: "Prescripciones", description: "Llenado rápido y seguro de tus recetas médicas.", color: "text-blue-600", bg: "bg-blue-100" },
  { icon: "syringe", title: "Vacunación", description: "Vacunas para toda la familia con nuestro equipo certificado.", color: "text-green-600", bg: "bg-green-100" },
  { icon: "baby", title: "WIC Services", description: "Apoyamos la salud de tu bebé y tu familia.", color: "text-yellow-600", bg: "bg-yellow-100" },
  { icon: "leaf", title: "Bienestar", description: "Vitaminas, suplementos y productos de bienestar.", color: "text-emerald-600", bg: "bg-emerald-100" },
  { icon: "truck", title: "Delivery", description: "Llevamos tu orden a tu puerta en San Juan.", color: "text-blue-500", bg: "bg-blue-100" },
  { icon: "sparkles", title: "Productos Premium", description: "Perfumes árabes, cuidado personal y más.", color: "text-red-500", bg: "bg-red-100" },
];

export type ProductCategory = {
  name: string;
  desc: string;
  emoji: string;
  gradient: string;
  border: string;
  badge: string;
  items: string[];
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { name: "Medicamentos OTC", desc: "Dolor, fiebre, alergia, resfriado y digestivo", emoji: "💊", gradient: "from-blue-50 to-blue-100", border: "border-blue-200", badge: "bg-blue-600", items: ["Tylenol", "Advil", "Aleve", "Motrin", "Bayer", "Claritin", "Zyrtec", "Mucinex", "Pepto-Bismol"] },
  { name: "Vitaminas & Suplementos", desc: "Vitaminas, minerales, omega y colágeno", emoji: "🌿", gradient: "from-green-50 to-green-100", border: "border-green-200", badge: "bg-green-600", items: ["Mason Natural", "Natural Systems", "Caltrate", "Olly", "Emergen-C", "Centrum", "Sambucol"] },
  { name: "Primeros Auxilios", desc: "Vendajes, antisépticos, gasa y más", emoji: "🩹", gradient: "from-red-50 to-red-100", border: "border-red-200", badge: "bg-red-600", items: ["Band-Aid", "Neosporin", "Nexcare", "Curad", "Q-tips", "Alcohol", "Agua Oxigenada"] },
  { name: "Equipo Médico", desc: "Nebulizadores, monitores y humidificadores", emoji: "🏥", gradient: "from-purple-50 to-purple-100", border: "border-purple-200", badge: "bg-purple-600", items: ["Nebulizadores", "Monitor de presión", "Vicks Vaporizer", "Flonase", "NeilMed"] },
  { name: "Dolor Muscular", desc: "Cremas, parches y geles para alivio", emoji: "💪", gradient: "from-orange-50 to-orange-100", border: "border-orange-200", badge: "bg-orange-600", items: ["IcyHot", "Bengay", "Biofreeze", "Salonpas", "Voltaren", "Tiger Balm"] },
  { name: "Salud Ocular & Nasal", desc: "Gotas, sprays y soluciones", emoji: "👁️", gradient: "from-cyan-50 to-cyan-100", border: "border-cyan-200", badge: "bg-cyan-600", items: ["Visine", "Systane", "Refresh", "Flonase", "Afrin", "NeilMed"] },
  { name: "Bebé & Mamá", desc: "Pañales, cremas, fórmulas y accesorios", emoji: "👶", gradient: "from-pink-50 to-pink-100", border: "border-pink-200", badge: "bg-pink-500", items: ["Huggies", "Pull-Ups", "Johnson\'s", "Aveeno Baby", "Desitin", "Enfamil", "Gerber"] },
  { name: "Vitaminas Infantiles", desc: "Vitaminas y suplementos para niños", emoji: "🧸", gradient: "from-yellow-50 to-yellow-100", border: "border-yellow-200", badge: "bg-yellow-500", items: ["Flintstones", "Olly Kids", "Emergen-C", "Sambucol Kids", "Emulsión de Escocia"] },
  { name: "Productos Naturales", desc: "Hierbas, tés medicinales y naturales", emoji: "🌱", gradient: "from-emerald-50 to-emerald-100", border: "border-emerald-200", badge: "bg-emerald-600", items: ["Celestial", "3 Ballerina", "Bigelow", "Nopalina", "Chia Seeds", "Linaza"] },
  { name: "Grocery & Alimentos", desc: "Arroz, enlatados, cereales y harinas", emoji: "🛒", gradient: "from-amber-50 to-amber-100", border: "border-amber-200", badge: "bg-amber-600", items: ["Canilla Rice", "Chef Boyardee", "Carmela", "Goya", "Maicena", "Quaker"] },
  { name: "Leches & Bebidas", desc: "Leche regular, vegetal y fórmulas", emoji: "🥛", gradient: "from-sky-50 to-sky-100", border: "border-sky-200", badge: "bg-sky-600", items: ["Parmalat", "Silk", "Califia", "Ensure", "Glucerna", "Nestlé", "Nesquik"] },
  { name: "Snacks & Dulces", desc: "Chips, galletas, nueces y chocolates", emoji: "🍿", gradient: "from-rose-50 to-rose-100", border: "border-rose-200", badge: "bg-rose-500", items: ["Pringles", "Takis", "Doritos", "Oreo", "Ritz", "Nutella", "Haribo"] },
  { name: "Refrescos & Agua", desc: "Sodas, jugos, agua y bebidas", emoji: "🥤", gradient: "from-teal-50 to-teal-100", border: "border-teal-200", badge: "bg-teal-600", items: ["Pepsi", "Coca-Cola", "Sprite", "7-Up", "Malta India", "Agua Niña"] },
  { name: "Juguetes & Regalos", desc: "Juguetes, juegos y canastas de regalo", emoji: "🎁", gradient: "from-violet-50 to-violet-100", border: "border-violet-200", badge: "bg-violet-600", items: ["Unicorn Academy", "Simon", "Canastas regalo", "Peluches"] },
];

export const HEALTH_HUB = [
  { icon: "🌙", category: "Sueño", title: "Cómo mejorar la calidad de tu sueño", color: "bg-indigo-50 border-indigo-100" },
  { icon: "🧘", category: "Bienestar", title: "Maneja el estrés y vive mejor", color: "bg-purple-50 border-purple-100" },
  { icon: "❤️", category: "Salud del Corazón", title: "Cuida tu corazón, protege tu vida", color: "bg-red-50 border-red-100" },
  { icon: "🥗", category: "Nutrición", title: "Guía de vitaminas esenciales", color: "bg-green-50 border-green-100" },
  { icon: "👨‍👩‍👧", category: "Familia", title: "Salud para toda la familia", color: "bg-blue-50 border-blue-100" },
];

export const WHY_CHOOSE = [
  { icon: "🤝", title: "Cuidado personalizado", desc: "Te conocemos por nombre, no por número de receta." },
  { icon: "⚡", title: "Servicio rápido", desc: "Refills listos el mismo día, sin largas esperas." },
  { icon: "👨‍⚕️", title: "Farmacéuticos de confianza", desc: "Equipo certificado con raíces en nuestra comunidad." },
  { icon: "🚚", title: "Delivery disponible", desc: "Recibe tus medicamentos en la comodidad de tu hogar." },
  { icon: "🌿", title: "Productos de bienestar", desc: "Vitaminas, suplementos y cuidado personal de calidad." },
  { icon: "🏘️", title: "Enfoque comunitario", desc: "Orgullosamente locales, sirviendo a Puerto Rico." },
];
