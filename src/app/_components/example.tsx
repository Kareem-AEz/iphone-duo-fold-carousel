import type { ReactNode } from "react";

import { CodeBlock } from "@/app/_components/code-block";
import { readExampleCode } from "@/app/_components/examples/example-code.query";

type ExampleProps = {
  title: string;
  description: string;
  /** The file in `examples/` that `children` comes from. */
  file: string;
  children: ReactNode;
};

/** A live example above the source of its own file, so the code shown is the code running. */
export async function Example({
  title,
  description,
  file,
  children,
}: ExampleProps) {
  const code = await readExampleCode(file);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm text-pretty">
          {description}
        </p>
      </div>

      <div className="rounded-xl border">
        {/* The padding clears the leaf, which reaches past the frame mid-turn. */}
        <div className="flex justify-center px-4 py-14">{children}</div>
        <div className="bg-muted/40 rounded-b-xl border-t">
          <CodeBlock code={code} />
        </div>
      </div>
    </div>
  );
}
