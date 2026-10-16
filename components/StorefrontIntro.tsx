"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Search, ShoppingCart, Menu, X, Truck, Store, Baby, Syringe, ArrowRight, Clock3, ShieldCheck, HeartPulse, Sparkles, PackageSearch } from "lucide-react";
import Logo from "@/components/Logo";
import { useCart } from "@/components/CartProvider";
import { BRAND, HOURS } from "@/lib/data";

const nav = [
  ["Medicamentos", "/productos/medicamentos-otc"],
  ["Vitaminas y suplementos", "/productos/vitaminas-suplementos"],
  ["Cuidado personal", "#products"],
  ["Salud familiar", "/productos/bebe-mama"],
  ["Equipo médico", "/productos/equipo-medico"],
  ["Promociones", "#products"],
] as const;

const tiles = [
  { title: "Medicamentos OTC", href: "/productos/medicamentos-otc", icon: HeartPulse, bg: "bg-sky-50", color: "text-blue-700" },
  { title: "Vitaminas y suplementos", href: "/productos/vitaminas-suplementos", icon: Sparkles, bg: "bg-lime-50", color: "text-green-700" },
  { title: "Cuidado personal", href: "#products", icon: ShieldCheck, bg: "bg-teal-50", color: "text-teal-700" },
  { title: "Salud familiar", href: "/productos/bebe-mama", icon: Baby, bg: "bg-rose-50", color: "text-rose-700" },
  { title: "Equipo médico", href: "/productos/equipo-medico", icon: HeartPulse, bg: "bg-blue-50", color: "text-blue-700" },
  { title: "Hogar y bienestar", href: "/productos/grocery-alimentos", icon: Store, bg: "bg-amber-50", color: "text-amber-700" },
  { title: "Ofertas y productos", href: "#products", icon: ShoppingCart, bg: "bg-red-50", color: "text-red-600" },
];

export default function StorefrontIntro() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }
  return <div id="top" className="bg-[#f5faff] text-[#10264e]">
    <div className="border-b border-sky-100 bg-[#e9f6fc]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-2 text-[11px] font-medium sm:text-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href={BRAND.mapsLinkSrc} className="inline-flex items-center gap-1"><MapPin size={13} className="text-green-600" /> San Juan, PR</a>
          <a href={BRAND.phoneHref} className="inline-flex items-center gap-1"><Phone size={13} className="text-blue-700" /> {BRAND.phone}</a>
          <span className="inline-flex items-center gap-1"><Clock3 size={13} className="text-blue-700" /> {HOURS[0].day}: {HOURS[0].time}</span>
        </div>
        <div className="flex items-center gap-3"><a href="#about">Sobre nosotros</a><a href="#contact">Contacto</a><span className="font-bold">ES</span></div>
      </div>
    </div>
    <div className="bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 lg:gap-8">
        <Link href="/" className="shrink-0"><Logo /></Link>
        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:flex">
          <label className="sr-only" htmlFor="store-search">Buscar productos</label>
          <input id="store-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Explora medicamentos, vitaminas y cuidado personal..." className="min-w-0 flex-1 px-5 py-3 text-sm outline-none" />
          <button aria-label="Explorar catálogo" className="bg-[#0769ad] px-5 text-white"><Search size={19}/></button>
        </form>
        <Link href="/admin/login" className="ml-auto hidden items-center gap-2 whitespace-nowrap text-sm font-semibold lg:flex">Iniciar sesión</Link>
        <Link href="/cart" className="relative flex items-center gap-2 whitespace-nowrap font-bold" aria-label={"Carrito con " + itemCount + " artículos"}>
          <ShoppingCart className="text-[#0c3768]" size={27}/><span className="hidden text-sm sm:block">Carrito</span>
          {itemCount>0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white">{itemCount}</span>}
        </Link>
        <button className="lg:hidden" aria-label="Abrir menú" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
      </div>
    </div>
    <div className="border-y border-slate-100 bg-white">
      <nav className="mx-auto hidden max-w-7xl items-center justify-between gap-3 px-4 py-3 text-xs font-bold lg:flex">
        <a href="#products" className="rounded-lg bg-[#0873b8] px-5 py-3 text-white">☰ Todas las categorías</a>
        {nav.map(([label,href])=><Link key={label} href={href} className="hover:text-green-700">{label}</Link>)}
      </nav>
      {menuOpen && <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 lg:hidden">
        <Link href="/admin/login" className="rounded-lg p-3 text-sm" onClick={()=>setMenuOpen(false)}>Iniciar sesión</Link>
        {nav.map(([label,href])=><Link key={label} href={href} className="rounded-lg p-3 text-sm" onClick={()=>setMenuOpen(false)}>{label}</Link>)}
      </nav>}
    </div>
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-[#eaf9ff] via-white to-[#d7f4ef]">
      <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#8bd43b]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-[#42b3e8]/25 blur-3xl" />
      <div className="mx-auto grid min-h-[400px] max-w-7xl items-center gap-6 px-5 py-10 md:grid-cols-2 md:py-16 lg:min-h-[485px]">
        <div className="relative z-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-green-700 shadow-sm"><ShieldCheck size={15}/> Tu farmacia en Puerto Rico</span>
          <h1 className="max-w-xl text-[2.65rem] font-black uppercase leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.4rem]">TU SALUD <span className="block text-[#238a39]">ES NUESTRA</span> PRIORIDAD</h1>
          <p className="mt-5 max-w-md text-base font-medium text-[#245778] sm:text-lg">Medicamentos · Salud · Bienestar para toda la familia.</p>
          <a href="#products" className="mt-7 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#208b35] to-[#58b928] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-700/15">Explorar catálogo <ArrowRight size={17}/></a>
          <div className="mt-9 grid max-w-lg grid-cols-3 gap-3 text-[11px] font-semibold sm:text-xs">
            <a href="#delivery" className="flex items-center gap-2"><Truck className="shrink-0 text-blue-700" size={24}/> Delivery</a>
            <a href="#contact" className="flex items-center gap-2"><Store className="shrink-0 text-blue-700" size={24}/> Recoge en tienda</a>
            <a href="#services" className="flex items-center gap-2"><ShieldCheck className="shrink-0 text-blue-700" size={24}/> Servicios WIC</a>
          </div>
        </div>
        <div className="relative flex min-h-[290px] items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d5f0ed] to-[#a7d9ef] shadow-xl md:min-h-[380px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1100&q=85')] bg-cover bg-center opacity-90" role="img" aria-label="Profesional de salud en una farmacia" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b4271]/55 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur-sm">
            <span className="rounded-xl bg-green-100 p-3 text-green-700"><Truck size={28}/></span>
            <div><p className="font-extrabold">Delivery disponible</p><p className="text-xs text-slate-600">Consulta cobertura y disponibilidad</p></div>
            <a href="#delivery" className="ml-auto rounded-full bg-[#0871ad] px-4 py-2 text-xs font-bold text-white">Ver más</a>
          </div>
        </div>
      </div>
    </section>
    <section aria-label="Categorías principales" className="mx-auto max-w-7xl px-4 py-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map(({title,href,icon:Icon,bg,color})=><Link key={title} href={href} className={bg+" group flex min-h-[122px] flex-col items-center justify-center gap-3 rounded-2xl border border-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"}>
          <Icon size={35} strokeWidth={1.7} className={color+" transition group-hover:scale-110"}/>
          <span className="text-xs font-bold leading-tight">{title}</span>
        </Link>)}
      </div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-3">
      <a href="#services" className="relative min-h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-[#d9f3d9] to-[#a9dfb8] p-6">
        <div className="absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-white/40"/>
        <p className="relative text-xl font-black text-[#10264e]">Programa <span className="block text-4xl text-green-700">WIC</span></p>
        <p className="relative mt-2 max-w-[220px] text-sm">Apoyando el bienestar de tu familia.</p>
        <span className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold">Conoce más <ArrowRight size={14}/></span>
      </a>
      <a href="#services" className="relative min-h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-[#d8efff] to-[#8ccdf1] p-6">
        <Syringe className="absolute bottom-0 right-4 h-32 w-32 text-[#0a74b4]/20"/>
        <p className="relative max-w-[220px] text-2xl font-black leading-tight">Vacunas para todas las edades</p>
        <p className="relative mt-3 text-sm">Consulta las vacunas disponibles.</p>
        <span className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold">Conoce más <ArrowRight size={14}/></span>
      </a>
      <a href="#products" className="relative min-h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffebed] to-[#f6cddc] p-6">
        <Sparkles className="absolute bottom-0 right-4 h-32 w-32 text-[#d04b80]/20"/>
        <p className="relative max-w-[220px] text-2xl font-black leading-tight">Cuidado personal y belleza</p>
        <p className="relative mt-3 max-w-[230px] text-sm">Explora nuestras categorías.</p>
        <span className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold">Ver productos <ArrowRight size={14}/></span>
      </a>
    </section>
    <div className="mx-auto max-w-7xl px-4 pb-4"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-extrabold">Explora nuestros productos</h2><a href="#products" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700">Ver categorías <ArrowRight size={14}/></a></div><p className="mt-2 text-sm text-slate-600">Precios y disponibilidad se muestran únicamente cuando estén verificados en el catálogo.</p></div>
  </div>;
}
