import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { slugify } from "@/lib/utils";

async function signUp(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || "Honduras";

  if (!email || !password || !displayName) {
    return redirect(
      "/register?error=" + encodeURIComponent("Datos incompletos"),
    );
  }
  if (password.length < 6) {
    return redirect(
      "/register?error=" +
        encodeURIComponent("La contraseña debe tener al menos 6 caracteres"),
    );
  }

  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: displayName,
        country,
        suggested_slug: slugify(displayName),
      },
    },
  });

  if (error) {
    return redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // If a session is returned (email confirmation off), update the auto-created
  // profile with the city the user supplied.
  if (data.session && city) {
    await supabase
      .from("profiles")
      .update({ city })
      .eq("id", data.user!.id);
  }

  if (data.session) {
    redirect("/album");
  }

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja.",
      ),
  );
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/album");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tu información de cartas se guarda asociada a tu cuenta.
        </p>

        {searchParams.error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        ) : null}

        <form action={signUp} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Nombre visible</Label>
            <Input id="display_name" name="display_name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" placeholder="Tegucigalpa" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">País</Label>
              <Input id="country" name="country" defaultValue="Honduras" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-brand-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
