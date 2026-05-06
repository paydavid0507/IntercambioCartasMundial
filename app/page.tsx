import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogIn, UserPlus, BookmarkPlus, Copy, Shuffle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function Wc2026Icon({ className }: { className?: string }) {
  // Soccer ball icon — universal World Cup symbol
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
    <main className="flex flex-1 flex-col">

      {/* HERO — dark, stadium energy */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-slate-950">

        {/* Ambient grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Amber glow top-right */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        {/* Blue glow bottom-left */}
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-5 py-5">
          <span className="font-display text-2xl tracking-wide text-white">
            INTERCAMBIA
          </span>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:text-white">
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

        {/* Main headline */}
        <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-5 pb-16 pt-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
            <Wc2026Icon className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium tracking-wider text-amber-300 uppercase">
              Mundial 2026
            </span>
          </div>

          <h1 className="font-display text-[clamp(3.5rem,18vw,7rem)] leading-none tracking-wide text-white">
            INTERCAMBIA<br />
            <span className="text-amber-400">TUS FIGUS</span><br />
            DEL MUNDIAL
          </h1>

          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">
            Registra tus faltantes y repetidas, encuentra coincidencias automáticas y coordina intercambios con otros coleccionistas.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95 sm:w-auto">
                Empezar gratis
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-6 py-3.5 text-base font-medium text-slate-200 backdrop-blur transition hover:border-slate-500 hover:bg-slate-700 active:scale-95 sm:w-auto">
                <LogIn className="h-4 w-4" />
                Ya tengo cuenta
              </button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-6 text-xs text-slate-600">
            Gratis · Sin publicidad · Para coleccionistas de Honduras
          </p>
        </div>

        {/* Diagonal divider */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-slate-50"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
        />
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 px-5 pb-20 pt-8">
        <p className="mb-8 text-center font-display text-3xl tracking-wide text-slate-800 sm:text-4xl">
          TODO EN UN LUGAR
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={BookmarkPlus}
            color="bg-brand-50 text-brand-600"
            title="Faltantes"
            description="Importa de golpe con MEX: 1-20 o agrega carta por carta."
          />
          <FeatureCard
            icon={Copy}
            color="bg-amber-50 text-amber-600"
            title="Repetidas"
            description="Indica cuántas tienes y actualiza cantidades en cualquier momento."
          />
          <FeatureCard
            icon={Shuffle}
            color="bg-emerald-50 text-emerald-600"
            title="Coincidencias"
            description="Las coincidencias mutuas aparecen primero: tú das, ellos dan."
          />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>No oficial · Solo para coleccionistas</span>
          <span className="text-slate-300">·</span>
          <Link href="/privacidad" className="hover:text-slate-600 underline underline-offset-2 transition-colors">
            Política de privacidad
          </Link>
          <img
            src="/avatar.png"
            alt=""
            className="h-4 w-4 rounded-full object-cover"
          />
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  color,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-xl p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl tracking-wide text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
