import { SimplificationResult } from "./SimplificationResult.ts";

export class SimplificationPrinter {
      static print(result: SimplificationResult): string {
            const lines: string[] = [];
            const steps = result.steps;

            const validSteps = steps.filter(step => step.before.toString() !== step.after.toString());

            if (validSteps.length === 0) {
                  return `  ${result.initial.toString()}\n\nResultado: ${result.result.toString()}`;
            }

            const maxGlobalLen = Math.max(
                  result.initial.toString().length,
                  ...validSteps.map(s => s.globalState.toString().length)
            );
            const maxRuleLen = Math.max(...validSteps.map(s => s.rule.name.length));
            const maxBeforeLen = Math.max(...validSteps.map(s => s.before.toString().length));

            lines.push(`  ${result.initial.toString()}`);

            for (const step of validSteps) {
                  const globalState = step.globalState.toString().padEnd(maxGlobalLen, " ");
                  const ruleName = step.rule.name.padEnd(maxRuleLen, " ");
                  const localBefore = step.before.toString().padStart(maxBeforeLen, " ");
                  const localAfter = step.after.toString();

                  lines.push(
                        `= ${globalState}  │  ${ruleName}  │  ${localBefore} → ${localAfter}`
                  );
            }

            lines.push(`\nResultado: ${result.result.toString()}`);
            return lines.join("\n");
      }
}
