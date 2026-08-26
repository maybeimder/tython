import { Expression, ExpressionKind } from "../models/Expressions/Expression.ts";
import { BinaryExpression } from "../models/Expressions/kind/BinaryExpression.ts";
import { IdentifierExpression } from "../models/Expressions/kind/IdentifierExpression.ts";
import { NumericExpression } from "../models/Expressions/kind/NumericExpression.ts";


export class AstPrinter {
      print(node: Expression): void {
            this.printNode(node, "", true, true);
      }

      private printNode(node: Expression, prefix: string, isLast: boolean, isRoot: boolean): void {
            const connector = isRoot ? "" : (isLast ? "└── " : "├── ");
            console.log(prefix + connector + this.label(node));

            const children = this.getChildren(node);
            const childPrefix = isRoot ? "" : prefix + (isLast ? "    " : "│   ");

            children.forEach((child, index) => {
                  const last = index === children.length - 1;
                  this.printNode(child, childPrefix, last, false);
            });
      }

      private label(node: Expression): string {
            switch (node.kind) {
                  case ExpressionKind.Binary:
                        return `(${(node as BinaryExpression).operator})`;
                  case ExpressionKind.Numeric:
                        return `(${(node as NumericExpression).value})`;
                  case ExpressionKind.Identifier:
                        return `(${(node as IdentifierExpression).lexeme})`;
                  default:
                        return "UnknownExpression";
            }
      }

      private getChildren(node: Expression): Expression[] {
            if (node.kind === ExpressionKind.Binary) {
                  const binary = node as BinaryExpression;
                  return [binary.left, binary.right];
            }
            return [];
      }
}
