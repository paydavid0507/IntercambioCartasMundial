import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordInput } from "@/components/ui/PasswordInput";

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return redirect("/login?error=" + encodeURIComponent("Datos incompletos"));
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return redirect("/login?error=" + encodeURIComponent("Correo o contraseña incorrectos"));
  }
  redirect("/album");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/album");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-12">
      {/* Brand strip */}
      <div className="mb-8 text-center">
        <Link href="/" className="font-display text-4xl tracking-wide text-white">
          INTERCAMBIA
        </Link>
        <p className="mt-1 text-sm text-slate-500">Mundial 2026</p>
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Card header */}
        <div className="border-b border-slate-800 px-6 py-4">
          <h1 className="font-display text-2xl tracking-wide text-white">INICIAR SESIÓN</h1>
          <p className="mt-0.5 text-sm text-slate-400">Accede a tu colección</p>
        </div>

        <div className="px-6 py-5">
          {searchParams.error && (
            <div className="mb-4 rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-3 text-sm text-red-400">
              {searchParams.error}
            </div>
          )}
          {searchParams.message && (
            <div className="mb-4 rounded-xl bg-emerald-950/50 border border-emerald-800/50 px-4 py-3 text-sm text-emerald-400">
              {searchParams.message}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">Correo</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
              <PasswordInput id="password" name="password" autoComplete="current-password" required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
            </div>
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95">
              <LogIn className="h-4 w-4" />
              Entrar
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/recover" className="text-slate-400 hover:text-amber-400 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link href="/register" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
