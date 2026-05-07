import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { slugify } from "@/lib/utils";

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = String(formData.get("display_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const show_contact = formData.get("show_contact") === "on";
  const notify_matches = formData.get("notify_matches") === "on";
  const slugInput = String(formData.get("share_slug") ?? "").trim();
  const share_slug = slugInput ? slugify(slugInput) : slugify(display_name);

  if (!display_name) {
    return redirect(
      "/profile?error=" + encodeURIComponent("El nombre es obligatorio"),
    );
  }
  if (!share_slug) {
    return redirect(
      "/profile?error=" + encodeURIComponent("El slug no puede quedar vacío"),
    );
  }

  // Make sure no other user is using the slug.
  const { data: collision } = await supabase
    .from("profiles")
    .select("id")
    .eq("share_slug", share_slug)
    .neq("id", user.id)
    .maybeSingle();
  if (collision) {
    return redirect(
      "/profile?error=" +
        encodeURIComponent("Ese slug ya está en uso, prueba con otro"),
    );
  }

  // notify_matches not yet in generated Supabase types — cast until types are regenerated
  const profileUpdate: Record<string, unknown> = {
    display_name,
    city,
    country,
    whatsapp,
    show_contact,
    notify_matches,
    share_slug,
  };

  const { error } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (error) {
    return redirect("/profile?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/profile");
  redirect(
    "/profile?message=" + encodeURIComponent("Perfil actualizado"),
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intercambio-cartas-mundial.vercel.app";
  const publicUrl = profile ? `${origin}/u/${profile.share_slug}` : "";

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <span className="mt-2 h-7 w-[3px] flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h1 className="font-display text-4xl tracking-wide text-slate-900">MI PERFIL</h1>
          <p className="text-sm text-slate-500">Esta información se usa para que otros usuarios puedan contactarte.</p>
        </div>
      </header>

      {searchParams.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}
      {searchParams.message ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {searchParams.message}
        </p>
      ) : null}

      <form
        action={updateProfile}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Nombre visible</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile?.city ?? ""}
              placeholder="Tegucigalpa"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              name="country"
              defaultValue={profile?.country ?? "Honduras"}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={profile?.whatsapp ?? ""}
            placeholder="+504 9999 9999"
          />
        </div>

        <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm">
          <input
            type="checkbox"
            name="show_contact"
            defaultChecked={profile?.show_contact ?? false}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            <span className="font-medium">Mostrar mi WhatsApp públicamente</span>
            <span className="block text-slate-500">
              Si está apagado, otros usuarios solo verán tu nombre y ubicación.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm">
          <input
            type="checkbox"
            name="notify_matches"
            defaultChecked={(profile as { notify_matches?: boolean })?.notify_matches ?? false}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            <span className="font-medium">Notificarme cuando haya nuevos intercambios</span>
            <span className="block text-slate-500">
              Te avisamos en tu bandeja cuando alguien agregue cartas que te faltan o necesite las tuyas. Si tienes WhatsApp público, el mensaje incluirá un enlace directo.
            </span>
          </span>
        </label>

        <div className="space-y-1.5">
          <Label htmlFor="share_slug">Slug del enlace público</Label>
          <Input
            id="share_slug"
            name="share_slug"
            defaultValue={profile?.share_slug ?? ""}
            placeholder="david-benavides"
          />
          {profile ? (
            <p className="text-xs text-slate-500">
              Tu enlace público:{" "}
              <a
                href={`/u/${profile.share_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-brand-700 underline hover:text-brand-800 break-all"
              >
                {publicUrl}
              </a>
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">
            <Save className="mr-1.5 h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </form>

      <p className="text-xs text-slate-500">
        Cuenta: {user.email}
      </p>
    </div>
  );
}
