import Link from "next/link";
import { LogOut } from "lucide-react";
import { NavLinks } from "@/components/NavLinks";

export function Navbar({ displayName }: { displayName: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 relative">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-400/40 to-transparent" />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/album"
          className="font-display text-xl tracking-wide text-white whitespace-nowrap"
        >
          INTERCAMBIA
        </Link>

        <NavLinks />

        <form action="/auth/sign-out" method="post" className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-400 sm:inline">{displayName}</span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
