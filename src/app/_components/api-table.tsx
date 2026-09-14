export type ApiRow = {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
};

type ApiTableProps = {
  rows: ApiRow[];
  /** What the first column lists, like "Prop" or "Value". */
  label?: string;
};

/** A reference table. The description sits under each name, so it stays readable on a phone. */
export function ApiTable({ rows, label = "Prop" }: ApiTableProps) {
  const hasDefaults = rows.some((row) => row.defaultValue);

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground border-b">
          <tr>
            <th className="px-4 py-2.5 font-normal">{label}</th>
            <th className="px-4 py-2.5 font-normal">Type</th>
            {hasDefaults && (
              <th className="px-4 py-2.5 font-normal">Default</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b align-top last:border-0">
              <td className="flex flex-col gap-1 px-4 py-3">
                <code className="font-mono text-[0.8125rem]">{row.name}</code>
                <span className="text-muted-foreground min-w-48 text-pretty">
                  {row.description}
                </span>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[0.8125rem] whitespace-nowrap">
                  {row.type}
                </code>
              </td>
              {hasDefaults && (
                <td className="px-4 py-3">
                  <code className="text-muted-foreground font-mono text-[0.8125rem] whitespace-nowrap">
                    {row.defaultValue ?? "–"}
                  </code>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
