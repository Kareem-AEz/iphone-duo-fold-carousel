import { codeToHtml } from "shiki";

import { CopyButton } from "@/app/_components/copy-button";

type CodeBlockProps = {
  code: string;
  lang?: "tsx" | "bash";
};

/** Highlighted code with a copy button. Highlighting runs on the server, so it ships no JavaScript. */
export async function CodeBlock({ code, lang = "tsx" }: CodeBlockProps) {
  const html = await codeToHtml(code.trim(), { lang, theme: "github-light" });

  return (
    <div className="relative">
      <div
        // Shiki escapes the source it highlights, so this is safe to inject.
        dangerouslySetInnerHTML={{ __html: html }}
        className="overflow-x-auto font-mono text-[0.8125rem] leading-relaxed [&_pre]:bg-transparent! [&_pre]:py-4 [&_pre]:pr-14 [&_pre]:pl-4"
      />
      <div className="absolute top-2.5 right-2.5">
        <CopyButton text={code.trim()} />
      </div>
    </div>
  );
}
