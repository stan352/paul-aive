import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Découverte" },
  { href: "/pitch", label: "Pitch" },
  { href: "/closing", label: "Closing" },
] as const;

export function PaulHeader({ active }: { active: (typeof NAV_ITEMS)[number]["href"] }) {
  return (
    <header className="flex w-full max-w-2xl flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-7 rounded-lg bg-gradient-aive" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            PAUL
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Pitch Accelerator for Ultimate Leverage
        </p>
      </div>
      <nav className="flex gap-1 rounded-full bg-muted p-1 text-sm">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              "rounded-full px-3 py-1 transition-colors " +
              (active === item.href
                ? "bg-gradient-aive text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
