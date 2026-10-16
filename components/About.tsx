"use client";
import { CheckCircle2, HeartPulse, ShieldCheck, Users, MapPin } from "lucide-react";
import { BRAND } from "@/lib/data";
export default function About() {
  return <section id="about" className="bg-white py-16 text-[#10264e] sm:py-20"><div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
    <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#d8f3e1] to-[#c6ebfb]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1100&q=85')] bg-cover bg-center" role="img" aria-label="Profesional de la salud"/>
      <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-md"><HeartPulse className="text-[#268d3b]" size={28}/><div><p className="font-extrabold">Tu salud es nuestra prioridad</p><p className="text-xs text-slate-600">Atención cercana para nuestra comunidad</p></div></div>
    </div>
    <div><span className="text-xs font-extrabold uppercase tracking-widest text-[#238c3c]">Conócenos</span><h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Tu farmacia de confianza <span className="text-[#238c3c]">en San Juan</span></h2><p className="mt-5 text-base leading-7 text-slate-600">En First Choice Pharmacy trabajamos para ofrecer una experiencia sencilla, accesible y cercana para el cuidado de tu salud y la de tu familia.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {[{icon:Users,title:"Atención personalizada",text:"Un equipo dispuesto a orientarte."},{icon:ShieldCheck,title:"Servicios de farmacia",text:"Consulta sobre recetas y vacunas."},{icon:HeartPulse,title:"Bienestar familiar",text:"Productos y servicios para distintas etapas."},{icon:MapPin,title:"Estamos cerca",text:"Ubicados en San Juan, Puerto Rico."}].map(({icon:Icon,title,text})=><div key={title} className="rounded-2xl border border-sky-100 bg-[#f5fbff] p-4"><Icon className="text-[#238c3c]" size={24}/><h3 className="mt-3 text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div>)}
      </div><a href={BRAND.mapsLinkSrc} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0b6da8] px-6 py-3 text-sm font-bold text-white">Visítanos <CheckCircle2 size={16}/></a>
    </div>
  </div></section>;
}
