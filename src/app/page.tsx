import type { ReactNode } from "react";

import { ApiReference } from "@/app/_components/api-reference";
import { CodeBlock } from "@/app/_components/code-block";
import { Example } from "@/app/_components/example";
import { BookExample } from "@/app/_components/examples/book-example";
import { ControlsExample } from "@/app/_components/examples/controls-example";
import { DEMO_SLIDES } from "@/app/_components/examples/demo-slides";
import { DoorExample } from "@/app/_components/examples/door-example";
import { readExampleCode } from "@/app/_components/examples/example-code.query";
import { HowItWorks } from "@/app/_components/how-it-works/how-it-works";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";

const INSTALL =
  "npx shadcn@latest add Kareem-AEz/iphone-duo-fold-carousel/fold-carousel";

const ACCESSIBILITY = [
  "Arrow keys change slides while focus is inside the carousel, including after clicking a slide.",
  "Screen readers hear each slide once, and a live region announces the slide on change.",
  "The hidden copies of each slide are inert, so Tab never lands on them.",
  "Previous and next stay focusable at the ends when loop is off.",
  "With reduced motion turned on, slides cut instead of folding.",
];

export default async function Home() {
  const usage = await readExampleCode("door-example.tsx");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <SiteHeader />

      <main className="flex flex-col gap-24 pb-24">
        <section className="flex flex-col items-center gap-6 pt-12 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-balance">
            Fold Carousel
          </h1>
          <p className="text-muted-foreground max-w-md text-pretty">
            A carousel that folds from one slide to the next, like a two-panel
            phone. The image stays flat and the frame changes shape around it.
          </p>
          {/* The padding clears the leaf, which reaches past the frame mid-turn. */}
          <div className="py-16">
            <DoorExample slides={DEMO_SLIDES} />
          </div>
        </section>

        <Section title="Installation">
          <p className="text-muted-foreground text-sm text-pretty">
            Needs a project set up with shadcn. Adds{" "}
            <code className="font-mono text-[0.8125rem]">
              components/ui/fold-carousel
            </code>{" "}
            and installs motion, lucide-react, and cn.
          </p>
          <div className="bg-muted/40 rounded-xl border">
            <CodeBlock code={INSTALL} lang="bash" />
          </div>
        </Section>

        <Section title="Usage">
          <div className="bg-muted/40 rounded-xl border">
            <CodeBlock code={usage} />
          </div>
        </Section>

        <Section title="Examples">
          <div className="flex flex-col gap-16">
            <Example
              title="Book"
              description="The next slide lies underneath and the fold uncovers it, like turning a page."
              file="book-example.tsx"
            >
              <BookExample slides={DEMO_SLIDES} />
            </Example>
            <Example
              title="Custom controls, no loop"
              description="useFoldCarousel drives your own dots. Without a loop, the buttons disable at either end."
              file="controls-example.tsx"
            >
              <ControlsExample slides={DEMO_SLIDES} />
            </Example>
          </div>
        </Section>

        <Section title="How it works">
          <p className="text-muted-foreground text-sm text-pretty">
            The slide never rotates. Each face stays flat and is clipped to the
            outline a turning leaf would have, then blurred and shaded by how
            far it has tilted. Drag to scrub one fold.
          </p>
          <HowItWorks slides={DEMO_SLIDES} />
        </Section>

        <Section title="API">
          <ApiReference />
        </Section>

        <Section title="Accessibility">
          <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-5 text-sm">
            {ACCESSIBILITY.map((item) => (
              <li key={item} className="text-pretty">
                {item}
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
