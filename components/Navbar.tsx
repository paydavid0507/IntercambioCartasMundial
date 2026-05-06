import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NavLinks } from "@/components/NavLinks";

export function Navbar({
  displayName,
  unreadMessages,
}: {
  displayName: string;
  unreadMessages: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/album"
          className="text-base font-semibold tracking-tight whitespace-nowrap"
        >
          Intercambia Mundial 2026
        </Link>

        <NavLinks unreadMessages={unreadMessages} />

        <form action="/auth/sign-out" method="post" className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {displayName}
          </span>
          <Button variant="secondary" size="sm" type="submit">
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Salir
          </Button>
        </form>
      </div>
    </header>
  );
}
