import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { slugify, mapAuthError } from "@/lib/utils";

async function signUp(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || "Honduras";

  if (!email || !password || !displayName) {
    return redirect("/register?error=" + encodeURIComponent("Datos incompletos"));
  }
  if (password.length < 6) {
    return redirect("/register?error=" + encodeURIComponent("La contraseña debe tener al menos 6 caracteres"));
  }

  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { display_name: displayName, country, suggested_slug: slugify(displayName) },
    },
  });

  if (error) {
    return redirect("/register?error=" + encodeURIComponent(mapAuthError(error.message)));
  }
  if (data.session && city) {
    await supabase.from("profiles").update({ city }).eq("id", data.user!.id);
  }
  if (data.session) redirect("/album");

  redirect("/login?message=" + encodeURIComponent(
    "¡Cuenta creada! Revisa tu correo (incluyendo spam) y haz clic en el enlace de confirmación.",
  ));
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
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

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h1 className="font-display text-2xl tracking-wide text-white">CREAR CUENTA</h1>
          <p className="mt-0.5 text-sm text-slate-400">Únete a la comunidad de intercambio</p>
        </div>

        <div className="px-6 py-5">
          {searchParams.error && (
            <div className="mb-4 rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-3 text-sm text-red-400">
              {searchParams.error}
            </div>
          )}

          <form action={signUp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name" className="text-slate-300">Nombre visible</Label>
              <Input id="display_name" name="display_name" required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-slate-300">Ciudad</Label>
                <Input id="city" name="city" placeholder="Tegucigalpa"
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-slate-300">País</Label>
                <Input id="country" name="country" defaultValue="Honduras"
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">Correo</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
              <PasswordInput id="password" name="password" autoComplete="new-password" minLength={6} required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
            </div>
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95">
              <UserPlus className="h-4 w-4" />
              Crear cuenta
            </button>
          </form>

          <p className="mt-4 rounded-xl bg-slate-800/50 border border-slate-700/50 px-3 py-2 text-xs text-slate-400 text-center">
            Recibirás un correo de confirmación. Revisa también el spam.
          </p>

          <p className="mt-3 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-600">
            Al registrarte aceptas nuestra{" "}
            <Link href="/privacidad" className="text-slate-500 hover:text-amber-400 underline underline-offset-2 transition-colors">
              política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
