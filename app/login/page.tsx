import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
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
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Intercambia Mundial 2026
        </Link>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accede para administrar tus cartas e intercambios.
          </p>

          {searchParams.error ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </p>
          ) : null}
          {searchParams.message ? (
            <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {searchParams.message}
            </p>
          ) : null}

          <form action={signIn} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput id="password" name="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-1.5 h-4 w-4" />
              Entrar
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/recover" className="text-brand-700 hover:underline">
              Recuperar contraseña
            </Link>
            <Link href="/register" className="text-brand-700 hover:underline">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
