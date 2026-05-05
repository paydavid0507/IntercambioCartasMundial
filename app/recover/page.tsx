import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

async function sendRecoveryEmail(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return redirect(
      "/recover?error=" + encodeURIComponent("Ingresa tu correo"),
    );
  }
  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/profile`,
  });
  if (error) {
    return redirect("/recover?error=" + encodeURIComponent(error.message));
  }
  redirect(
    "/login?message=" +
      encodeURIComponent("Si la cuenta existe, te enviamos un correo."),
  );
}

export default function RecoverPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-slate-500">
          Te enviaremos un enlace para restablecerla.
        </p>

        {searchParams.error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        ) : null}

        <form action={sendRecoveryEmail} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full">
            Enviar enlace
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link href="/login" className="text-brand-700 hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
