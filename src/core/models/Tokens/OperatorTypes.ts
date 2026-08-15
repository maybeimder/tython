export enum OperatorType {
      "Add" = "Add",
      "Substract" = "Substract",
      "Multiply"="Multiply",
      "Divide"="Divide",
      "Power"="Power",
      "Assign"="Assign",
}

const lexemeToOperatorType: Record<string, OperatorType> = {
      "*": OperatorType.Multiply,
      "/": OperatorType.Divide,
      "+": OperatorType.Add,
      "-": OperatorType.Substract,
      "^": OperatorType.Power,
      ":=": OperatorType.Assign
}

export function toOperatorType(lexeme:string) {
      return lexemeToOperatorType[lexeme]
}
