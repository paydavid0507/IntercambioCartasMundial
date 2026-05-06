import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

async function sendRecoveryEmail(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return redirect("/recover?error=" + encodeURIComponent("Ingresa tu correo"));
  }
  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/profile`,
  });
  if (error) {
    return redirect("/recover?error=" + encodeURIComponent(mapAuthError(error.message)));
  }
  redirect("/login?message=" + encodeURIComponent("Si la cuenta existe, te enviamos un correo."));
}

export default function RecoverPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="font-display text-4xl tracking-wide text-white">
          INTERCAMBIA
        </Link>
        <p className="mt-1 text-sm text-slate-500">Mundial 2026</p>
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h1 className="font-display text-2xl tracking-wide text-white">RECUPERAR</h1>
          <p className="mt-0.5 text-sm text-slate-400">Te enviaremos un enlace para restablecerla</p>
        </div>

        <div className="px-6 py-5">
          {searchParams.error && (
            <div className="mb-4 rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-3 text-sm text-red-400">
              {searchParams.error}
            </div>
          )}

          <form action={sendRecoveryEmail} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">Correo</Label>
              <Input id="email" name="email" type="email" required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20" />
            </div>
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95">
              <Mail className="h-4 w-4" />
              Enviar enlace
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
