import { GitHubLogo } from "@/app/_components/brand-logos";

const REPOSITORY = "https://github.com/Kareem-AEz/iphone-duo-fold-carousel";

/** The page's one line of chrome: the component's name and its repository. */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-5">
      <span className="font-mono text-sm">fold-carousel</span>
      <a
        href={REPOSITORY}
        aria-label="GitHub repository"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative -mr-2 grid size-9 place-items-center rounded-md transition-colors outline-none after:absolute after:-inset-1 focus-visible:ring-3"
      >
        <GitHubLogo className="size-4" />
      </a>
    </header>
  );
}
