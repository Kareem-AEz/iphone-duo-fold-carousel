import { GitHubLogo, XLogo } from "@/app/_components/brand-logos";

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/Kareem-AEz",
    Logo: GitHubLogo,
    // The mark is a filled circle and reads larger than the X, so it gets the bigger box.
    size: "size-4",
  },
  {
    label: "X",
    href: "https://x.com/KareemAhmedEz",
    Logo: XLogo,
    size: "size-3.5",
  },
];

const PHOTO_CREDITS = [
  { name: "Elvin Muradzade", href: "https://www.pexels.com/photo/34492458/" },
  { name: "Massih", href: "https://www.pexels.com/photo/8177145/" },
  { name: "second897", href: "https://www.pexels.com/photo/8557328/" },
  { name: "cottonbro studio", href: "https://www.pexels.com/photo/9906684/" },
];

const CREDIT_LINK =
  "hover:text-foreground decoration-foreground/20 hover:decoration-foreground/50 underline underline-offset-2 transition-colors";

/** Who made it and where to find them, then the license and photo credits in a quieter line. */
export function SiteFooter() {
  return (
    <footer className="text-muted-foreground flex flex-col gap-3 border-t py-6">
      <div className="flex items-center justify-between">
        <p className="text-sm">Kareem Ahmed</p>

        <nav aria-label="Socials" className="-mr-2 flex items-center">
          {SOCIALS.map(({ label, href, Logo, size }, index) => (
            <div key={label} className="flex items-center">
              {index > 0 && (
                <span aria-hidden className="px-0.5 opacity-50 select-none">
                  /
                </span>
              )}
              <a
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground focus-visible:ring-ring/50 relative grid size-9 place-items-center rounded-md transition-colors outline-none after:absolute after:-inset-1 focus-visible:ring-3"
              >
                <Logo className={size} />
              </a>
            </div>
          ))}
        </nav>
      </div>

      <p className="text-xs/5 text-pretty">
        MIT License. Photos from Pexels by{" "}
        {PHOTO_CREDITS.map(({ name, href }, index) => (
          <span key={href}>
            {index > 0 && ", "}
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={CREDIT_LINK}
            >
              {name}
            </a>
          </span>
        ))}
        .
      </p>
    </footer>
  );
}
