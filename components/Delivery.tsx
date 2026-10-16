"use client";
import { Truck, Store, MapPin, Phone, ArrowRight, PackageCheck, ClipboardCheck, Home } from "lucide-react";
import { BRAND } from "@/lib/data";

export default function Delivery() {
  return <section id="delivery" className="bg-[#edf8fe] py-14 text-[#10264e] sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><span className="text-xs font-extrabold uppercase tracking-widest text-[#278a3c]">Comodidad para tu familia</span>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Delivery y recogido <span className="text-[#238c3c]">en tienda</span></h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Elige cómo prefieres recibir tus productos. Consulta cobertura, horarios y disponibilidad con nuestro equipo.</p>
        </div>
        <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-[#0b6ca9] px-6 py-3 text-sm font-bold text-white"><Phone size={17}/> Consultar por teléfono</a>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0877bb] to-[#063d79] p-7 text-white shadow-lg sm:p-9">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#50d0f2]/25"/>
          <div className="relative z-10"><span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold">Servicio de entrega</span>
            <Truck className="mt-7 h-14 w-14 text-[#a3e5ff]"/>
            <h3 className="mt-5 text-3xl font-extrabold">Delivery a tu hogar</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">Estamos en San Juan. Comunícate con nosotros para confirmar si tu dirección está dentro del área de servicio.</p>
            <a href={BRAND.whatsappText} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#064b84]">Consultar entrega <ArrowRight size={16}/></a>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-[#e8f9e8] to-[#c9edcd] p-7 shadow-sm sm:p-9">
          <div className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-white/50"/>
          <div className="relative z-10"><span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-xs font-bold text-green-800">Recogido coordinado</span>
            <Store className="mt-7 h-14 w-14 text-[#258e3c]"/>
            <h3 className="mt-5 text-3xl font-extrabold">Recoge en farmacia</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-700">Confirma la disponibilidad de tus productos y coordina tu visita para recogerlos en nuestro establecimiento.</p>
            <a href={BRAND.mapsLinkSrc} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#268d3c] px-6 py-3 text-sm font-extrabold text-white"><MapPin size={16}/> Cómo llegar <ArrowRight size={16}/></a>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-sky-100 bg-white px-5 py-8 shadow-sm sm:px-10">
        <h3 className="text-center text-xl font-extrabold">Así de fácil funciona</h3>
        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {[{icon:ClipboardCheck,n:"01",title:"Consulta",body:"Indícanos qué necesitas y cómo deseas recibirlo."},{icon:PackageCheck,n:"02",title:"Confirmamos",body:"Nuestro equipo verifica disponibilidad y coordina contigo."},{icon:Home,n:"03",title:"Recibes",body:"Coordinamos delivery o recogido, según disponibilidad."}].map(({icon:Icon,n,title,body})=><div key={n} className="flex gap-4 sm:flex-col sm:items-center sm:text-center"><div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e5f5fc] text-[#0874ae]"><Icon size={29}/><span className="absolute -right-2 -top-2 rounded-full bg-[#258d3b] px-2 py-1 text-[10px] font-black text-white">{n}</span></div><div><h4 className="font-extrabold">{title}</h4><p className="mt-1 text-sm text-slate-600">{body}</p></div></div>)}
        </div>
      </div>
    </div>
  </section>;
}
