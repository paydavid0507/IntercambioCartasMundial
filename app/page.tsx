import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogIn, BookmarkPlus, Copy, Shuffle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function Wc2026Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93V15l-3.5-2.02V10.5l1.5-.87 3 1.73 3-1.73 1.5.87v2.48L13 15v1.93A8.01 8.01 0 0 1 11 16.93zM18.93 13H17.5l-1.5-.87v-1.26l2.07-1.2c.55.97.89 2.07.86 3.33zM15.5 7.13 14 8l-2-1.15V5.07a8.01 8.01 0 0 1 3.5 2.06zM10 5.07v1.78L8 8 6.5 7.13A8.01 8.01 0 0 1 10 5.07zM5.93 10.67 8 11.87v1.26L6.5 14H5.07a8.04 8.04 0 0 1-.14-3.33z" />
    </svg>
  );
}

export default async function Landing() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/album");

  return (
    <main className="flex min-h-[100svh] flex-col">

      {/* ── HERO OSCURO — 70svh ── */}
      <section className="relative flex h-[70svh] flex-col overflow-hidden bg-slate-950">

        {/* Número 26 decorativo de fondo */}
        <span
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-display leading-none text-white/[0.03]"
          style={{ fontSize: "clamp(14rem, 50vw, 28rem)" }}
          aria-hidden
        >
          26
        </span>

        {/* Glow amber arriba derecha */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/25 blur-3xl" />
        {/* Glow azul abajo izquierda */}
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />

        {/* Grid sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-5 py-4">
          <span className="font-display text-xl tracking-wide text-white">INTERCAMBIA</span>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:text-white">
                Entrar
              </button>
            </Link>
            <Link href="/register">
              <button className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400">
                Registrarse
              </button>
            </Link>
          </nav>
        </header>

        {/* Contenido centrado verticalmente */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5">

          {/* Badge */}
          <div className="animate-fade-up mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 w-fit">
            <Wc2026Icon className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-semibold tracking-widest text-amber-300 uppercase">Mundial 2026</span>
          </div>

          {/* Headline con línea de acento editorial */}
          <div className="animate-fade-up delay-100 flex items-start gap-3">
            <div className="mt-1 h-full w-0.5 self-stretch rounded-full bg-amber-500/60" />
            <h1 className="font-display text-[clamp(2.8rem,13vw,5.5rem)] leading-[0.9] tracking-wide text-white">
              INTERCAMBIA<br />
              <span className="text-amber-400">TUS FIGUS</span><br />
              DEL MUNDIAL
            </h1>
          </div>

          <p className="animate-fade-up delay-200 mt-3 max-w-xs pl-5 text-sm leading-relaxed text-slate-400">
            Registra faltantes y repetidas, encuentra coincidencias y coordina intercambios.
          </p>

          <div className="animate-fade-up delay-300 mt-4 flex flex-wrap gap-2 pl-5">
            <Link href="/register">
              <button className="group flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95">
                Empezar gratis
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur transition hover:bg-slate-700 active:scale-95">
                <LogIn className="h-3.5 w-3.5" />
                Ya tengo cuenta
              </button>
            </Link>
          </div>
        </div>

      </section>

      {/* ── FEATURE CARDS — 25svh ── */}
      <section className="flex h-[25svh] flex-col justify-center bg-white px-5">
        <div className="grid grid-cols-3 gap-2.5">
          <FeatureCard
            icon={BookmarkPlus}
            accent="bg-brand-50 text-brand-600"
            bar="bg-brand-500"
            title="Faltantes"
            desc="Importa MEX: 1-20"
          />
          <FeatureCard
            icon={Copy}
            accent="bg-amber-50 text-amber-600"
            bar="bg-amber-500"
            title="Repetidas"
            desc="Con cantidades"
          />
          <FeatureCard
            icon={Shuffle}
            accent="bg-emerald-50 text-emerald-600"
            bar="bg-emerald-500"
            title="Cambios"
            desc="Mutuas primero"
          />
        </div>
      </section>

      {/* ── FOOTER — 5svh ── */}
      <footer className="flex h-[5svh] w-full items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>No oficial · Para coleccionistas de Honduras</span>
          <span className="text-slate-200">·</span>
          <Link href="/privacidad" className="hover:text-slate-600 underline underline-offset-2 transition-colors">
            Privacidad
          </Link>
          <img src="/avatar.png" alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  accent,
  bar,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  bar: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      {/* Top accent bar */}
      <div className={`absolute left-0 right-0 top-0 h-0.5 ${bar}`} />
      <div className={`mb-2 inline-flex rounded-lg p-1.5 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-sm tracking-wide text-slate-900">{title}</p>
      <p className="mt-0.5 text-[10px] leading-tight text-slate-400">{desc}</p>
    </div>
  );
}
