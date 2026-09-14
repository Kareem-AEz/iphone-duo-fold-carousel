import { readFile } from "node:fs/promises";
import { join } from "node:path";

const EXAMPLES_DIR = join(process.cwd(), "src/app/_components/examples");

/**
 * The source of an example file, as it reads once installed. Examples import from the
 * registry folder, and an installed copy lives in `components/ui` instead.
 */
export async function readExampleCode(file: string) {
  const source = await readFile(join(EXAMPLES_DIR, file), "utf8");
  return source.replaceAll("@/registry/", "@/components/ui/");
}
