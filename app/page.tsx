import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export default async function Landing() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/album");

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Intercambia Mundial 2026
          </span>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Crear cuenta</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Administra tu álbum y encuentra intercambios
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Registra tus cartas faltantes y repetidas del Mundial 2026 y la
          aplicación buscará automáticamente coincidencias con otros usuarios.
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/register">
            <Button size="lg">Empezar gratis</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <FeatureCard
            title="Lista de faltantes"
            description="Selecciona país y número de carta, y la app valida que sean válidas (1 a 20)."
          />
          <FeatureCard
            title="Cartas repetidas"
            description="Indica cuántas tienes disponibles para intercambio. Edita o elimina en cualquier momento."
          />
          <FeatureCard
            title="Coincidencias automáticas"
            description="Mostramos primero las coincidencias mutuas: tú das, ellos dan."
          />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        Hecho con Next.js + Supabase. No afiliado a Panini.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
