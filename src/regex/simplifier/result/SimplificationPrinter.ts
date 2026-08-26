import { SimplificationResult } from "./SimplificationResult.ts";

export class SimplificationPrinter {
      static print(result: SimplificationResult): string {
            const lines: string[] = [];
            lines.push(result.initial.toString());

            for (const step of result.steps) {
                  const before = step.before.toString();
                  const after = step.after.toString();

                  if (before === after) continue;

                  lines.push(
                        `= ${after}    (${step.rule.name}: ${before} → ${after})`,
                  );
            }

            lines.push(`\nResultado: ${result.result.toString()}`);
            return lines.join("\n");
      }
}
