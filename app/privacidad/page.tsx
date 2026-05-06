import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad · Intercambia Mundial 2026",
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>
          <h1 className="mt-6 font-display text-5xl tracking-wide text-white">
            POLÍTICA DE<br />PRIVACIDAD
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Última actualización: mayo 2026
          </p>
        </div>

        <div className="space-y-8 text-slate-300">

          <Section title="1. Quiénes somos">
            <p>
              Intercambia Mundial 2026 es una aplicación gratuita e independiente que ayuda
              a coleccionistas a organizar sus figuritas del Mundial 2026 y coordinar
              intercambios con otros usuarios. No somos una empresa oficial ni tenemos
              ninguna afiliación con FIFA, federaciones de fútbol ni fabricantes de álbumes.
            </p>
          </Section>

          <Section title="2. Qué datos recopilamos">
            <p className="mb-3">Al crear una cuenta recopilamos:</p>
            <ul className="list-disc space-y-1.5 pl-5 text-slate-400">
              <li><span className="text-slate-300 font-medium">Correo electrónico</span> — necesario para crear tu cuenta e iniciar sesión.</li>
              <li><span className="text-slate-300 font-medium">Nombre visible</span> — el nombre que otros usuarios verán.</li>
              <li><span className="text-slate-300 font-medium">Ciudad y país</span> — opcional, para facilitar intercambios locales.</li>
              <li><span className="text-slate-300 font-medium">Número de WhatsApp</span> — completamente opcional. Solo se muestra públicamente si tú lo activas.</li>
              <li><span className="text-slate-300 font-medium">Cartas faltantes y repetidas</span> — los datos que tú mismo ingresas sobre tu colección.</li>
            </ul>
          </Section>

          <Section title="3. Para qué usamos tus datos">
            <ul className="list-disc space-y-1.5 pl-5 text-slate-400">
              <li>Identificarte en la aplicación.</li>
              <li>Mostrar tus cartas a otros usuarios para facilitar intercambios.</li>
              <li>Permitir que otros usuarios te envíen mensajes dentro de la plataforma.</li>
              <li>Mostrarte coincidencias automáticas con otros coleccionistas.</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white">No usamos tus datos para publicidad, no los vendemos ni los compartimos con terceros.</strong>
            </p>
          </Section>

          <Section title="4. Dónde se almacenan">
            <p>
              Tus datos se almacenan en <strong className="text-white">Supabase</strong> (base de datos PostgreSQL
              en la nube). Supabase cumple con estándares internacionales de seguridad.
              La aplicación está alojada en <strong className="text-white">Vercel</strong>.
            </p>
          </Section>

          <Section title="5. Información pública vs privada">
            <p className="mb-3">La siguiente información es <strong className="text-white">pública</strong> (visible para cualquier persona con tu enlace):</p>
            <ul className="list-disc space-y-1 pl-5 text-slate-400">
              <li>Nombre visible, ciudad, país</li>
              <li>Lista de cartas faltantes y repetidas</li>
              <li>Número de WhatsApp <span className="text-slate-500">(solo si tú lo activas en tu perfil)</span></li>
            </ul>
            <p className="mt-3 mb-3">La siguiente información es <strong className="text-white">privada</strong>:</p>
            <ul className="list-disc space-y-1 pl-5 text-slate-400">
              <li>Tu correo electrónico</li>
              <li>Mensajes intercambiados con otros usuarios</li>
            </ul>
          </Section>

          <Section title="6. Tus derechos">
            <ul className="list-disc space-y-1.5 pl-5 text-slate-400">
              <li>Puedes <strong className="text-white">editar o eliminar</strong> tu información desde tu perfil en cualquier momento.</li>
              <li>Puedes <strong className="text-white">eliminar todas tus cartas</strong> desde la sección Mi Álbum.</li>
              <li>Para eliminar completamente tu cuenta y todos tus datos, contáctanos al correo indicado abajo.</li>
            </ul>
          </Section>

          <Section title="7. Cookies y rastreo">
            <p>
              Solo usamos cookies de sesión necesarias para mantenerte autenticado.
              No usamos cookies de rastreo, analytics ni publicidad de ningún tipo.
            </p>
          </Section>

          <Section title="8. Menores de edad">
            <p>
              Esta aplicación no está dirigida a menores de 13 años. Si eres menor de 13,
              no debes crear una cuenta.
            </p>
          </Section>

          <Section title="9. Cambios a esta política">
            <p>
              Si realizamos cambios importantes a esta política, lo notificaremos
              en la aplicación. El uso continuo de la app después de los cambios
              implica tu aceptación.
            </p>
          </Section>

          <Section title="10. Contacto">
            <p>
              Si tienes preguntas sobre esta política o quieres eliminar tu cuenta,
              escríbenos a:{" "}
              <a
                href="mailto:davidbenavides86@gmail.com"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                davidbenavides86@gmail.com
              </a>
            </p>
          </Section>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          Intercambia Mundial 2026 · Aplicación independiente · No oficial
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl tracking-wide text-amber-400">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
